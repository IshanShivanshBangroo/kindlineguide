import { getIntervention } from './interventions.js';
import { buildFallback, isIdentityDrift } from './safety.js';
import { buildSupportContractPrompt, normalizePreferences } from './preferences.js';

const SUPPORT_MOVES = ['reflect', 'clarify', 'reframe', 'action'];

function normalizeHistory(history = []) {
  return Array.isArray(history)
    ? history.filter((item) => item && typeof item.content === 'string' && (item.role === 'user' || item.role === 'assistant'))
    : [];
}

function shouldSkipAssistantHistory(text = '', preferences = {}) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return true;
  if (isIdentityDrift(trimmed)) return true;
  if (/Ishan Bangroo/i.test(trimmed)) return true;
  if (/\b(local emergency services|crisis resource|diagnosis|treatment instructions)\b/i.test(trimmed) && trimmed.length < 260) return true;
  if (/^I am here( with you)?\./i.test(trimmed)) return true;
  if (/^Main yahan hoon\./i.test(trimmed)) return true;
  if (/^मैं यहाँ हूँ/i.test(trimmed)) return true;
  if (/^Tell me one recent moment/i.test(trimmed)) return true;
  if (/^Ek recent moment batao/i.test(trimmed)) return true;
  if (/^हाल का एक ऐसा पल/i.test(trimmed)) return true;

  const boundaryLike = [
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
  ].some((reason) => buildFallback({ reason, preferences }).toLowerCase() === trimmed.toLowerCase());

  return boundaryLike;
}

export function buildModelMessages({ interventionId, history, preferences = {} }) {
  const intervention = getIntervention(interventionId);
  const prefs = normalizePreferences(preferences, history?.slice(-1)?.[0]?.content || '');
  const recentHistory = normalizeHistory(history).slice(-8);

  const instruction = `You are KindLine Guide, a bounded reflective-support tool for stressful moments.

Core response rules:
- Write one short paragraph under 85 words.
- Ask at most one question.
- Stay concrete and humane.
- Do not diagnose, prescribe, assess urgent symptoms, explain hidden motives as facts, or provide legal or emergency management advice.
- Do not complete external tasks such as email writing, translation, coding, or general knowledge help.
- Do not claim to be Meta AI, OpenAI, Google, or "an AI language model".
- If asked who developed the tool, answer that KindLine Guide was developed by Ishan Bangroo.
- Keep the reply inside the active support mode and the support contract.
- The JSON schema controls the output format. Fill it carefully.`;

  const fieldGuidance = `Field guidance:
- draft_response: the actual bounded supportive paragraph.
- model_risk: a conservative number from 0 to 1. Use a higher value if the request is outside scope or if you are unsure.
- scope_note: one short sentence explaining why the response stays in scope.
- micro_skill: optional short skill label. Prefer one of [${intervention.microSkills.map((item) => `"${item}"`).join(', ')}].
- support_move: optional high-level move. Use one of [${SUPPORT_MOVES.map((item) => `"${item}"`).join(', ')}].`;

  const messages = [
    { role: 'system', content: intervention.systemPrompt },
    { role: 'system', content: instruction },
    { role: 'system', content: fieldGuidance },
    { role: 'system', content: buildSupportContractPrompt(prefs) }
  ];

  for (const item of recentHistory) {
    if (item.role === 'assistant' && shouldSkipAssistantHistory(item.content, prefs)) continue;
    messages.push({ role: item.role, content: item.content.trim() });
  }

  return { intervention, preferences: prefs, messages };
}

export function buildRescueMessages({ interventionId, history, preferences = {} }) {
  const intervention = getIntervention(interventionId);
  const prefs = normalizePreferences(preferences, history?.slice(-1)?.[0]?.content || '');
  const recentHistory = normalizeHistory(history).slice(-6);

  const messages = [
    {
      role: 'system',
      content: `${intervention.systemPrompt}

Only help with bounded reflective coping support. Do not complete external tasks. If the message is mainly a task or knowledge request, redirect to the stressful or difficult part instead. Return only one short paragraph under 85 words. No JSON. No bullet points. Ask at most one question. Do not mention being Meta AI or another platform. Keep the reply inside the support contract.`
    },
    {
      role: 'system',
      content: buildSupportContractPrompt(prefs)
    }
  ];

  for (const item of recentHistory) {
    if (item.role === 'assistant' && shouldSkipAssistantHistory(item.content, prefs)) continue;
    messages.push({ role: item.role, content: item.content.trim() });
  }

  return { intervention, preferences: prefs, messages };
}
