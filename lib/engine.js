import { buildModelMessages, buildRescueMessages } from './prompting.js';
import { assessSafety, buildFallback, buildSafetySummary, isIdentityDrift } from './safety.js';
import { assessPurpose } from './purpose.js';
import { computeUncertainty } from './uncertainty.js';
import { extractStructuredResponse, extractUsableText } from './parsing.js';
import { RESPONSE_SCHEMA } from './response-schema.js';
import { getIntervention } from './interventions.js';
import { buildLocalSupportReply } from './local-reply.js';
import { normalizePreferences, languageInstructionForHumans } from './preferences.js';

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function asNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function currentTimestamp() {
  return new Date().toISOString();
}

function normalizeHistory(history) {
  return Array.isArray(history)
    ? history
        .filter((item) => item && typeof item.content === 'string' && (item.role === 'user' || item.role === 'assistant'))
        .map((item) => ({ role: item.role, content: item.content.trim() }))
    : [];
}

function getUsage(modelResponse) {
  if (!modelResponse || typeof modelResponse === 'string') return null;
  return modelResponse?.usage || modelResponse?.response?.usage || null;
}

function getRawModelPreview(modelResponse) {
  if (typeof modelResponse === 'string') {
    return {
      responseType: 'string',
      hasChoices: false,
      finishReason: null,
      hasToolCalls: false,
      hasFunctionCall: false,
      contentPreview: modelResponse.slice(0, 280)
    };
  }

  const message = modelResponse?.choices?.[0]?.message;
  const content = message?.content;
  return {
    responseType: typeof modelResponse?.response,
    hasChoices: Array.isArray(modelResponse?.choices),
    finishReason: modelResponse?.choices?.[0]?.finish_reason || null,
    hasToolCalls:
      (Array.isArray(modelResponse?.tool_calls) && modelResponse.tool_calls.length > 0) ||
      (Array.isArray(message?.tool_calls) && message.tool_calls.length > 0),
    hasFunctionCall: Boolean(message?.function_call),
    contentPreview:
      typeof content === 'string'
        ? content.slice(0, 280)
        : Array.isArray(content)
          ? content.map((part) => (typeof part === 'string' ? part : part?.text || part?.content || '')).join('').slice(0, 280)
          : typeof modelResponse?.response === 'string'
            ? modelResponse.response.slice(0, 280)
            : typeof modelResponse?.response === 'object'
              ? JSON.stringify(modelResponse.response).slice(0, 280)
              : null
  };
}

function wordCount(text = '') {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function countQuestions(text = '') {
  const matches = String(text).match(/\?/g);
  return matches ? matches.length : 0;
}

function buildResponseStats(text = '') {
  return {
    wordCount: wordCount(text),
    questionCount: countQuestions(text)
  };
}

function normalizeText(text = '') {
  return String(text || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}

function computeCombinedRisk({ uncertainty, selfRisk, ruleRisk }) {
  const u = uncertainty?.available ? uncertainty.score : 0.25;
  const s = clamp(asNumber(selfRisk, 0.35), 0, 1);
  const r = clamp(asNumber(ruleRisk, 0), 0, 1);
  return Number((0.55 * u + 0.25 * s + 0.2 * r).toFixed(4));
}

function buildInterventionPayload(intervention) {
  return {
    id: intervention.id,
    label: intervention.label,
    researchLabel: intervention.researchLabel,
    userLabel: intervention.userLabel,
    theoryBasis: intervention.theoryBasis,
    selectionNote: intervention.selectionNote,
    defaultThreshold: intervention.defaultThreshold
  };
}

function baseUncertainty() {
  return { available: false, score: null, meanEntropy: null, meanSurprisal: null, tokenCount: 0 };
}

function getLastAssistantText(history = []) {
  const lastAssistant = [...history].reverse().find((item) => item.role === 'assistant' && item.content);
  return lastAssistant?.content || '';
}

function isFallbackLike(text = '', preferences = {}) {
  const normalized = normalizeText(text);
  const reasons = [
    'tool_meta',
    'social_checkin',
    'opening_prompt',
    'low_specificity_support',
    'purpose_boundary',
    'crisis_precheck',
    'violence_precheck',
    'medical_boundary',
    'uncertainty_gate',
    'model_error'
  ];
  return reasons.some((reason) => normalizeText(buildFallback({ reason, preferences })) === normalized);
}

function isGenericSupportDraft({ draft, purpose, userText, history, preferences }) {
  const cleaned = String(draft || '').trim();
  if (!cleaned || purpose?.kind !== 'supportive') return false;

  const normalized = normalizeText(cleaned);
  if (isFallbackLike(cleaned, preferences)) return true;
  if (isIdentityDrift(cleaned)) return true;
  if (/^i am here for brief reflective support\b/i.test(cleaned)) return true;
  if (/^i am here with you\.?$/i.test(cleaned)) return true;
  if (/i'?m here to listen/i.test(cleaned)) return true;
  if (/i'?m happy to chat with you/i.test(cleaned)) return true;
  if (/tell me one recent moment that felt difficult/i.test(cleaned)) return true;
  if (/tell me more about what'?s on your mind/i.test(cleaned)) return true;
  if (/tell me what is on your mind/i.test(cleaned)) return true;
  if (/how can i support you today/i.test(cleaned)) return true;
  if (/kindline guide was developed by ishan bangroo/i.test(normalized)) return true;

  const lastAssistant = getLastAssistantText(history);
  if (lastAssistant && normalized === normalizeText(lastAssistant) && wordCount(cleaned) <= 55) return true;

  return false;
}

async function tryStructuredGeneration({ env, model, messages }) {
  let modelResponse;
  try {
    modelResponse = await env.AI.run(model, {
      messages,
      response_format: RESPONSE_SCHEMA,
      max_tokens: 220,
      temperature: 0.25,
      top_p: 0.9
    });
  } catch (error) {
    return { ok: false, error, modelResponse: null, parsed: null };
  }

  const parsed = extractStructuredResponse(modelResponse);
  return {
    ok: Boolean(parsed && typeof parsed.draft_response === 'string' && parsed.draft_response.trim()),
    modelResponse,
    parsed,
    error: null
  };
}

async function tryRescueGeneration({ env, model, interventionId, history, preferences }) {
  const { messages } = buildRescueMessages({ interventionId, history, preferences });
  try {
    const modelResponse = await env.AI.run(model, {
      messages,
      max_tokens: 180,
      temperature: 0.35,
      top_p: 0.9
    });
    const text = extractUsableText(modelResponse);
    if (!text) return { ok: false, modelResponse, parsed: null };
    return {
      ok: true,
      modelResponse,
      parsed: {
        draft_response: text,
        model_risk: 0.32,
        scope_note: 'Recovered from unstructured model output after the structured pass failed.',
        micro_skill: null,
        support_move: 'reflect'
      }
    };
  } catch (error) {
    return { ok: false, modelResponse: null, parsed: null, error };
  }
}

function buildBaseReturn({ sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource, preferences, purpose, startedAt, finalText, draftText = null, gateTriggered, gateReason, combinedRisk, selfRisk, ruleRisk, uncertainty = baseUncertainty(), scopeNote, usage = null, structuredRecovered = false, rawModelPreview = null, responseStats = null }) {
  const stats = responseStats || buildResponseStats(finalText);
  const safetySummary = buildSafetySummary({
    gateTriggered,
    gateReason,
    supportModeLabel: intervention.userLabel,
    thresholdSource
  });

  return {
    ok: true,
    uiMode,
    model,
    reply: finalText,
    draft: draftText,
    supportMode: buildInterventionPayload(intervention),
    purpose,
    preferences: {
      replyLanguage: preferences.replyLanguage,
      replyTone: preferences.replyTone,
      meaningStyle: preferences.meaningStyle,
      meaningStyleLabel: preferences.meaningStyleLabel,
      effectiveLanguage: preferences.effectiveLanguage,
      effectiveLanguageLabel: preferences.effectiveLanguageLabel,
      contractSummary: languageInstructionForHumans(preferences),
      contextNote: preferences.contextNote,
      contextNoteProvided: Boolean(preferences.contextNote)
    },
    scopeNote,
    safetySummary,
    responseStats: stats,
    gate: {
      triggered: gateTriggered,
      reason: gateReason,
      combinedRisk,
      gateScore: combinedRisk,
      uncertainty,
      selfRisk,
      ruleRisk,
      threshold: safeThreshold,
      thresholdSource
    },
    usage,
    logEntry: {
      sessionId,
      evalCaseId,
      uiMode,
      timestamp: currentTimestamp(),
      userText,
      assistantDraft: draftText,
      assistantFinal: finalText,
      supportModeId: intervention.id,
      supportModeUserLabel: intervention.userLabel,
      supportModeResearchLabel: intervention.researchLabel,
      gateTriggered,
      gateReason,
      combinedRisk,
      gateScore: combinedRisk,
      uncertaintyScore: uncertainty.score,
      meanEntropy: uncertainty.meanEntropy,
      meanSurprisal: uncertainty.meanSurprisal,
      selfRisk,
      ruleRisk,
      threshold: safeThreshold,
      thresholdSource,
      purpose,
      preferences: {
        replyLanguage: preferences.replyLanguage,
        replyTone: preferences.replyTone,
        meaningStyle: preferences.meaningStyle,
        meaningStyleLabel: preferences.meaningStyleLabel,
        effectiveLanguage: preferences.effectiveLanguage,
        effectiveLanguageLabel: preferences.effectiveLanguageLabel,
        contextNote: preferences.contextNote,
        contextNoteProvided: Boolean(preferences.contextNote)
      },
      latencyMs: Date.now() - startedAt,
      usage,
      structuredRecovered,
      rawModelPreview,
      safetySummary,
      responseStats: stats,
      scopeNote
    }
  };
}

function buildBoundaryReturn({ sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource, reason, finalText, combinedRisk, selfRisk, ruleRisk, scopeNote, startedAt, purpose, preferences }) {
  return buildBaseReturn({
    sessionId,
    evalCaseId,
    uiMode,
    model,
    userText,
    intervention,
    safeThreshold,
    thresholdSource,
    preferences,
    purpose,
    startedAt,
    finalText,
    draftText: null,
    gateTriggered: true,
    gateReason: reason,
    combinedRisk,
    selfRisk,
    ruleRisk,
    uncertainty: baseUncertainty(),
    scopeNote,
    usage: null,
    structuredRecovered: false,
    rawModelPreview: null
  });
}

function buildLocalReturn({ sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource, purpose, preferences, startedAt, generation, reason = 'model_error', selfRisk = 0.62, scopeNote }) {
  const localReply = buildLocalSupportReply({ interventionId: intervention.id, userText, preferences, reason });
  return buildBaseReturn({
    sessionId,
    evalCaseId,
    uiMode,
    model,
    userText,
    intervention,
    safeThreshold,
    thresholdSource,
    preferences,
    purpose,
    startedAt,
    finalText: localReply,
    draftText: generation?.parsed?.draft_response || null,
    gateTriggered: true,
    gateReason: reason,
    combinedRisk: computeCombinedRisk({ uncertainty: baseUncertainty(), selfRisk, ruleRisk: Math.max(generation?.ruleRisk || 0.3, 0.3) }),
    selfRisk,
    ruleRisk: Math.max(generation?.ruleRisk || 0.3, 0.3),
    uncertainty: baseUncertainty(),
    scopeNote: scopeNote || 'A deterministic bounded reply was used because the model draft was unreliable for this turn.',
    usage: getUsage(generation?.modelResponse || null),
    structuredRecovered: false,
    rawModelPreview: getRawModelPreview(generation?.modelResponse || null)
  });
}

export async function runSupportTurn({ env, sessionId, interventionId, threshold, history, evalCaseId = null, uiMode = 'participant', preferences = {}, contextNote = '' }) {
  const startedAt = Date.now();
  const normalizedHistory = normalizeHistory(history);
  const lastUser = [...normalizedHistory].reverse().find((item) => item.role === 'user');
  if (!lastUser) {
    throw new Error('A support turn requires at least one user message.');
  }

  const userText = lastUser.content.trim();
  const mergedPreferences = normalizePreferences({ ...preferences, contextNote: preferences?.contextNote ?? contextNote }, userText);
  const intervention = getIntervention(interventionId);
  const thresholdProvided = uiMode === 'research' && threshold !== null && threshold !== undefined && threshold !== '';
  const effectiveThreshold = thresholdProvided ? threshold : intervention.defaultThreshold;
  const safeThreshold = clamp(asNumber(effectiveThreshold, intervention.defaultThreshold), 0.2, 0.95);
  const thresholdSource = thresholdProvided ? 'research_override' : 'mode_default';

  const precheck = assessSafety(userText);
  const purpose = assessPurpose(userText, mergedPreferences);
  const model = env.MODEL_NAME || DEFAULT_MODEL;

  if (precheck.flags.crisis) {
    return buildBoundaryReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      reason: 'crisis_precheck',
      finalText: buildFallback({ reason: 'crisis_precheck', supportModeLabel: intervention.userLabel, preferences: mergedPreferences }),
      combinedRisk: 1, selfRisk: 1, ruleRisk: 1,
      scopeNote: 'Crisis content was handled before model generation.',
      startedAt, purpose, preferences: mergedPreferences
    });
  }

  if (precheck.flags.violence) {
    return buildBoundaryReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      reason: 'violence_precheck',
      finalText: buildFallback({ reason: 'violence_precheck', supportModeLabel: intervention.userLabel, preferences: mergedPreferences }),
      combinedRisk: 1, selfRisk: 1, ruleRisk: 1,
      scopeNote: 'Violence content was handled before model generation.',
      startedAt, purpose, preferences: mergedPreferences
    });
  }

  if (precheck.flags.medical) {
    return buildBoundaryReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      reason: 'medical_boundary',
      finalText: buildFallback({ reason: 'medical_boundary', supportModeLabel: intervention.userLabel, preferences: mergedPreferences }),
      combinedRisk: 0.95, selfRisk: 1, ruleRisk: 0.85,
      scopeNote: 'Medical content was handled before model generation.',
      startedAt, purpose, preferences: mergedPreferences
    });
  }

  if (purpose.kind === 'tool_meta') {
    return buildBoundaryReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      reason: 'tool_meta',
      finalText: buildLocalSupportReply({ interventionId, userText, preferences: mergedPreferences, reason: 'tool_meta' }),
      combinedRisk: 0.08, selfRisk: 0.02, ruleRisk: 0,
      scopeNote: 'A brief question about the artifact itself was answered with a fixed attribution reply.',
      startedAt, purpose, preferences: mergedPreferences
    });
  }

  if (purpose.kind === 'social_checkin') {
    return buildBoundaryReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      reason: 'social_checkin',
      finalText: buildLocalSupportReply({ interventionId, userText, preferences: mergedPreferences, reason: 'social_checkin' }),
      combinedRisk: 0.18, selfRisk: 0.04, ruleRisk: 0,
      scopeNote: 'A short social check-in was answered with a bounded check-in reply.',
      startedAt, purpose, preferences: mergedPreferences
    });
  }

  if (purpose.kind === 'opening') {
    return buildBoundaryReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      reason: 'opening_prompt',
      finalText: buildLocalSupportReply({ interventionId, userText, preferences: mergedPreferences, reason: 'opening_prompt' }),
      combinedRisk: 0.22, selfRisk: 0.05, ruleRisk: 0,
      scopeNote: 'A very brief opening was routed to a scoped clarification instead of a full generated reply.',
      startedAt, purpose, preferences: mergedPreferences
    });
  }

  if (purpose.kind === 'low_specificity_support') {
    return buildBoundaryReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      reason: 'low_specificity_support',
      finalText: buildLocalSupportReply({ interventionId, userText, preferences: mergedPreferences, reason: 'low_specificity_support' }),
      combinedRisk: 0.26, selfRisk: 0.16, ruleRisk: Math.max(precheck.ruleRisk, 0.35),
      scopeNote: 'A low-specificity distress message was answered with a narrower clarification rather than a full reply.',
      startedAt, purpose, preferences: mergedPreferences
    });
  }

  if (purpose.kind === 'out_of_scope_task' || purpose.kind === 'task_under_stress') {
    return buildBoundaryReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      reason: 'purpose_boundary',
      finalText: buildLocalSupportReply({ interventionId, userText, preferences: mergedPreferences, reason: 'purpose_boundary' }),
      combinedRisk: 0.78, selfRisk: 0.8, ruleRisk: Math.max(precheck.ruleRisk, 0.55),
      scopeNote: purpose.kind === 'task_under_stress'
        ? 'The message asked the tool to complete an external task, so it was redirected back to reflective support.'
        : 'The message looked like a general task or knowledge request rather than reflective coping support.',
      startedAt, purpose, preferences: mergedPreferences
    });
  }

  const built = buildModelMessages({ interventionId, history: normalizedHistory, preferences: mergedPreferences });
  let generation = await tryStructuredGeneration({ env, model, messages: built.messages });
  let structuredRecovered = false;

  if (!generation.ok) {
    const rescued = await tryRescueGeneration({ env, model, interventionId, history: normalizedHistory, preferences: mergedPreferences });
    if (rescued.ok) {
      generation = {
        ok: true,
        modelResponse: rescued.modelResponse,
        parsed: rescued.parsed,
        error: generation.error || rescued.error
      };
      structuredRecovered = true;
    }
  }

  if (!generation.ok || !generation.parsed || typeof generation.parsed.draft_response !== 'string') {
    return buildLocalReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      purpose, preferences: mergedPreferences, startedAt, generation, reason: 'model_error'
    });
  }

  if (isIdentityDrift(generation.parsed.draft_response)) {
    return buildLocalReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      purpose, preferences: mergedPreferences, startedAt, generation, reason: 'identity_drift_filter', selfRisk: 0.82,
      scopeNote: 'The model drifted into generic assistant identity language, so the draft was replaced before delivery.'
    });
  }

  if (isGenericSupportDraft({ draft: generation.parsed.draft_response, purpose, userText, history: normalizedHistory, preferences: mergedPreferences })) {
    return buildLocalReturn({
      sessionId, evalCaseId, uiMode, model, userText, intervention, safeThreshold, thresholdSource,
      purpose, preferences: mergedPreferences, startedAt,
      generation: { ...generation, error: generation.error || new Error('Generic model draft was replaced by deterministic rescue.') },
      reason: 'generic_rescue',
      selfRisk: 0.58,
      scopeNote: 'The generated draft was too generic for the current input, so it was replaced with a narrower deterministic reply.'
    });
  }

  const parsed = generation.parsed;
  const uncertainty = computeUncertainty(generation.modelResponse);
  const postcheck = assessSafety(parsed.draft_response);
  const selfRisk = clamp(asNumber(parsed.model_risk, structuredRecovered ? 0.3 : 0.35), 0, 1);
  const ruleRisk = Math.max(precheck.ruleRisk, postcheck.ruleRisk);
  const combinedRisk = computeCombinedRisk({ uncertainty, selfRisk, ruleRisk });

  let gateReason = null;
  let finalText = String(parsed.draft_response || '').trim();
  if (postcheck.flags.crisis) {
    gateReason = 'crisis_postcheck';
    finalText = buildFallback({ reason: 'crisis_postcheck', supportModeLabel: intervention.userLabel, preferences: mergedPreferences });
  } else if (postcheck.flags.violence) {
    gateReason = 'violence_postcheck';
    finalText = buildFallback({ reason: 'violence_postcheck', supportModeLabel: intervention.userLabel, preferences: mergedPreferences });
  } else if (postcheck.flags.medical) {
    gateReason = 'medical_boundary';
    finalText = buildFallback({ reason: 'medical_boundary', supportModeLabel: intervention.userLabel, preferences: mergedPreferences });
  } else if (combinedRisk >= safeThreshold) {
    gateReason = 'uncertainty_gate';
    finalText = buildFallback({ reason: 'uncertainty_gate', supportModeLabel: intervention.userLabel, preferences: mergedPreferences });
  }

  const gateTriggered = Boolean(gateReason);
  const usage = getUsage(generation.modelResponse);

  return buildBaseReturn({
    sessionId,
    evalCaseId,
    uiMode,
    model,
    userText,
    intervention,
    safeThreshold,
    thresholdSource,
    preferences: mergedPreferences,
    purpose,
    startedAt,
    finalText,
    draftText: String(parsed.draft_response || '').trim(),
    gateTriggered,
    gateReason,
    combinedRisk,
    selfRisk,
    ruleRisk,
    uncertainty,
    scopeNote: parsed.scope_note,
    usage,
    structuredRecovered,
    rawModelPreview: getRawModelPreview(generation.modelResponse),
    responseStats: buildResponseStats(finalText)
  });
}
