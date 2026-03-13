import { getLocalizedMessage, normalizePreferences } from './preferences.js';

const CRISIS_PATTERNS = [
  /suicid/i,
  /kill myself/i,
  /end my life/i,
  /hurt myself/i,
  /self[-\s]?harm/i,
  /overdose/i,
  /i want to die/i,
  /can't go on/i,
  /can'?t go on/i,
  /not safe with myself/i,
  /jump off/i,
  /cut myself/i,
  /marna chahta/i,
  /khud ko nuksan/i,
  /जीना नहीं/i,
  /खुद को नुकसान/i
];

const MEDICAL_PATTERNS = [
  /diagnos/i,
  /prescrib/i,
  /dose/i,
  /dosage/i,
  /medication/i,
  /should i take/i,
  /what pill/i,
  /side effect/i,
  /chest pain/i,
  /shortness of breath/i,
  /cannot breathe/i,
  /can'?t breathe/i,
  /seizure/i,
  /pregnan/i,
  /blood pressure/i,
  /urgent care/i,
  /dawai/i,
  /medicine/i,
  /saans/i,
  /सीने में दर्द/i,
  /सांस/i
];

const DISTRESS_PATTERNS = [
  /hopeless/i,
  /worthless/i,
  /ashamed/i,
  /panic/i,
  /i hate myself/i,
  /burden/i,
  /disgusted with myself/i,
  /nobody would care/i,
  /i am broken/i,
  /i ruin everything/i,
  /i am low/i,
  /feeling low/i,
  /mood off/i,
  /not okay/i,
  /not ok/i,
  /thik nahi/i,
  /thik nhi/i,
  /theek nahi/i,
  /thik nai/i,
  /feeling down/i,
  /low feel/i
];

const VIOLENCE_PATTERNS = [
  /kill them/i,
  /kill him/i,
  /kill her/i,
  /hurt them/i,
  /hurt him/i,
  /hurt her/i,
  /hurt someone/i,
  /attack them/i,
  /stab/i,
  /shoot/i,
  /violence/i,
  /make them pay/i,
  /revenge tonight/i,
  /maar dunga/i,
  /maar dungi/i,
  /nuksan pahunch/i,
  /किसी को मार/i
];

const IDENTITY_DRIFT_PATTERNS = [
  /meta ai/i,
  /openai/i,
  /as an ai language model/i,
  /created by a team of people/i,
  /developed by meta/i,
  /made by meta/i,
  /trained by meta/i,
  /large language model/i,
  /team of people at meta/i,
  /created by google/i,
  /created by openai/i,
  /built by meta/i,
  /made by a team at meta/i,
  /i'?m happy to chat with you! i was created/i
];

function matchAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

export function assessSafety(text = '') {
  const normalized = String(text || '').trim();
  const flags = {
    crisis: matchAny(normalized, CRISIS_PATTERNS),
    medical: matchAny(normalized, MEDICAL_PATTERNS),
    highDistress: matchAny(normalized, DISTRESS_PATTERNS),
    violence: matchAny(normalized, VIOLENCE_PATTERNS)
  };

  let ruleRisk = 0;
  if (flags.highDistress) ruleRisk = Math.max(ruleRisk, 0.4);
  if (flags.medical) ruleRisk = Math.max(ruleRisk, 0.85);
  if (flags.crisis || flags.violence) ruleRisk = 1;

  return { flags, ruleRisk };
}

export function isIdentityDrift(text = '') {
  return matchAny(String(text || '').trim(), IDENTITY_DRIFT_PATTERNS);
}

export function buildFallback({ reason, preferences = {}, supportModeLabel = 'this support mode' }) {
  const prefs = normalizePreferences(preferences);

  switch (reason) {
    case 'tool_meta':
      return getLocalizedMessage('tool_meta', prefs);
    case 'social_checkin':
      return getLocalizedMessage('social_checkin', prefs);
    case 'opening_prompt':
      return getLocalizedMessage('opening_prompt', prefs);
    case 'low_specificity_support':
      return getLocalizedMessage('low_specificity_support', prefs);
    case 'purpose_boundary':
      return getLocalizedMessage('purpose_boundary', prefs, { supportModeLabel });
    case 'crisis_precheck':
    case 'crisis_postcheck':
      return getLocalizedMessage('crisis_precheck', prefs);
    case 'violence_precheck':
    case 'violence_postcheck':
      return getLocalizedMessage('violence_precheck', prefs);
    case 'medical_boundary':
      return getLocalizedMessage('medical_boundary', prefs);
    case 'uncertainty_gate':
      return getLocalizedMessage('uncertainty_gate', prefs, { supportModeLabel });
    case 'identity_drift_filter':
    case 'invalid_model_output':
    case 'model_error':
    case 'generic_rescue':
      return getLocalizedMessage('model_error', prefs);
    default:
      return getLocalizedMessage('local_support', prefs);
  }
}

export function buildSafetySummary({ gateTriggered, gateReason, supportModeLabel, thresholdSource = 'mode_default' }) {
  if (!gateTriggered) {
    return {
      label: 'Within scope',
      explanation: 'The reply stayed inside bounded reflective support and avoided diagnosis, treatment, or emergency instructions.',
      thresholdSource
    };
  }

  switch (gateReason) {
    case 'tool_meta':
      return {
        label: 'Tool information',
        explanation: 'The message asked about the artifact itself, so the tool returned a fixed attribution reply instead of starting a support turn.',
        thresholdSource
      };
    case 'social_checkin':
      return {
        label: 'Social check-in',
        explanation: 'A brief social opening was answered with a bounded check-in rather than a generic reflective prompt.',
        thresholdSource
      };
    case 'opening_prompt':
      return {
        label: 'Opening prompt',
        explanation: 'The tool asked for one concrete difficult moment instead of generating a full reply from a very brief opening.',
        thresholdSource
      };
    case 'low_specificity_support':
      return {
        label: 'Clarifying prompt',
        explanation: 'The message was too unspecific for a full reply, so the tool asked a narrower clarification first.',
        thresholdSource
      };
    case 'purpose_boundary':
      return {
        label: 'Purpose boundary',
        explanation: 'The tool did not complete an unrelated task and redirected the conversation back to reflective support.',
        thresholdSource
      };
    case 'crisis_precheck':
    case 'crisis_postcheck':
      return {
        label: 'Urgent self-harm boundary',
        explanation: 'The tool switched away from normal support because the message looked like immediate self-harm risk.',
        thresholdSource
      };
    case 'violence_precheck':
    case 'violence_postcheck':
      return {
        label: 'Urgent violence boundary',
        explanation: 'The tool switched away from normal support because the message looked like possible harm-to-others risk.',
        thresholdSource
      };
    case 'medical_boundary':
      return {
        label: 'Medical boundary',
        explanation: 'The tool stayed out of diagnosis and treatment advice and redirected the conversation to a safer support scope.',
        thresholdSource
      };
    case 'identity_drift_filter':
      return {
        label: 'Identity drift filtered',
        explanation: 'The model draft drifted into generic assistant identity, so the tool replaced it with a bounded support reply.',
        thresholdSource
      };
    case 'uncertainty_gate':
      return {
        label: 'Narrowed response',
        explanation: `The tool stayed with ${supportModeLabel.toLowerCase()} but switched to a more constrained reply because the draft looked too uncertain or too close to the boundary.`,
        thresholdSource
      };
    case 'invalid_model_output':
    case 'generic_rescue':
    case 'model_error':
      return {
        label: 'Simplified response',
        explanation: 'The model output was not reliable enough to deliver directly, so the tool returned a simpler bounded reply.',
        thresholdSource
      };
    default:
      return {
        label: 'Boundary applied',
        explanation: 'The tool used a narrower response to stay inside its support scope.',
        thresholdSource
      };
  }
}
