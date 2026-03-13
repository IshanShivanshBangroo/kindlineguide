import { normalizePreferences } from './preferences.js';

const SOCIAL_CHECKIN_PATTERNS = [
  /^\s*(hi|hello|hey|heyy|yo|sup|ssup|wassup|what'?s up|how are you|how r u|howre you|good morning|good afternoon|good evening)\b[!?.\s]*$/i,
  /^\s*(kaise ho|kaisa hai|kaisa ho|kaisi ho|kya haal hai|haal kaisa hai|thik ho|theek ho|kaise ho aap|namaste|नमस्ते)\s*[!?.\s]*$/iu,
  /^\s*(hola|buenas|bonjour|salut|hallo|ciao|oi|olá|ola|merhaba|salam|salaam|مرحبا|اهلا|أهلا|السلام عليكم|你好|嗨|こんにちは|안녕|안녕하세요|নমস্কার)\s*[!?.؟\s]*$/iu
];

const OPENING_PATTERNS = [
  /^\s*(help|help me|can you help me|can we start|start)\b[?.!\s]*$/i,
  /^\s*(not sure where to start|i do not know where to start|i'm not sure where to start|i am not sure where to start)\b[?.!\s]*$/i
];

const LOW_SPECIFICITY_PATTERNS = [
  /\b(i am low|i'm low|feeling low|i feel low|not okay|not ok|mood off|down today|not feeling good|not feeling okay|i am not okay|i'm not okay|i am down|i'm down|fine i guess|okayish|okish|just tired|just numb|not great|so-so|it is what it is|whatever i guess|meh)\b/i,
  /\b(thik nahi|thik nhi|theek nahi|theek nhi|mann nahi|acha nahi lag raha|heavy lag raha|low lag raha|bura lag raha|theek thak|thik thak|bas thik|bas theek|chal raha hai|bas chal raha hai)\b/i,
  /\b(udās|udaas|udahs)\b/i
];

const SUPPORT_PATTERNS = [
  /\b(feel|feeling|felt|stressed|stressful|anxious|worried|overwhelmed|ashamed|guilty|embarrassed|sad|upset|angry|frustrated|lonely|drained|exhausted|stuck|panic|panicking|scared|avoid|avoiding|procrastinat|replaying|replay|hardest|cope|coping|support|judging myself|self[-\s]?criticism|self[-\s]?critical|shame|pressure|tense|racing|burnt out|burned out|low|down)\b/i,
  /\b(i keep|i cannot stop|i can't stop|i do not know what to do|i don't know what to do|i need one small step|what happened|what feels hardest)\b/i,
  /\b(meeting|argument|conversation|email|deadline|family|friend|partner|work|school|class|task|message)\b/i,
  /\b(mushkil|pareshaan|tension|soch raha|soch rahi|stress|dikhat|problem|darr|dar|ghabra|low|thak gaya|thak gayi)\b/i
];

const TOOL_META_PATTERNS = [
  /\bwho\s+(built|made|developed|created)\s+(you|this|kindline|kindline guide|the tool|the app)\b/i,
  /\bwho\s+is\s+the\s+(developer|creator|author)\b/i,
  /\b(developer|creator|author)\b.*\b(kindline|tool|app)\b/i,
  /\bwho made you\b/i
];

const TASK_PATTERNS = [
  /\b(write code|debug|algorithm|function in python|javascript|sql query|regex|compile|stack trace)\b/i,
  /\b(translate|summarize|paraphrase|proofread|rewrite|draft an email|write an email|compose an email|write an essay|cover letter|resume|cv)\b/i,
  /\b(what is|who is|when is|where is|capital of|weather|stock price|exchange rate|news about|latest score)\b/i,
  /\b(calculate|solve|integral|derivative|equation|probability|homework|exam question)\b/i,
  /\b(book a flight|travel itinerary|restaurant recommendation|buy|shopping|product recommendation)\b/i,
  /\b(email likh do|code likh do|translate kar do|summarize kar do|solve kar do)\b/i
];

function wordCount(text = '') {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function matchAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function looksIndirectAndAffective(text, prefs) {
  const normalized = String(text || '').trim();
  if (!normalized) return false;
  const shortEnough = wordCount(normalized) <= 8;
  if (!shortEnough) return false;
  if (!['indirect', 'cultural_context'].includes(prefs?.meaningStyle)) return false;
  return /\b(fine i guess|okayish|okish|just tired|just numb|bas thik|bas theek|theek thak|thik thak|not great)\b/i.test(normalized);
}

function looksCultureDependent(text, prefs) {
  const normalized = String(text || '').trim();
  if (!normalized) return false;
  if (prefs?.meaningStyle !== 'cultural_context') return false;
  if (wordCount(normalized) > 9) return false;
  return /\b(okayish|okish|fine i guess|it is what it is|bas thik|bas theek|theek thak|thik thak|chal raha hai|bas chal raha hai|manage kar lenge|manage ho jayega)\b/i.test(normalized);
}

export function assessPurpose(text = '', preferences = {}) {
  const normalized = String(text || '').trim();
  const prefs = normalizePreferences(preferences, normalized);
  if (!normalized) {
    return {
      kind: 'opening',
      inScope: true,
      confidence: 0.8,
      explanation: 'Empty or near-empty message. Route to a scoped opening prompt.',
      effectiveLanguage: prefs.effectiveLanguage
    };
  }

  const hasSupportCue = matchAny(normalized, SUPPORT_PATTERNS);
  const hasTaskCue = matchAny(normalized, TASK_PATTERNS);
  const hasFirstPerson = /\b(i|i'm|i am|me|my|main|mera|meri|mujhe|mai|mein)\b/i.test(normalized);
  const veryShortNeutral = wordCount(normalized) <= 2 && !hasSupportCue && !hasTaskCue && !hasFirstPerson;

  if (matchAny(normalized, TOOL_META_PATTERNS)) {
    return {
      kind: 'tool_meta',
      inScope: true,
      confidence: 0.97,
      explanation: 'The message asks about the artifact itself, so it should receive a fixed attribution reply.',
      effectiveLanguage: prefs.effectiveLanguage
    };
  }

  if (matchAny(normalized, LOW_SPECIFICITY_PATTERNS) || looksIndirectAndAffective(normalized, prefs) || looksCultureDependent(normalized, prefs)) {
    return {
      kind: 'low_specificity_support',
      inScope: true,
      confidence: 0.9,
      explanation: looksCultureDependent(normalized, prefs)
        ? 'The wording may depend on community or cultural context, so the tool should clarify what the phrase means before interpreting it.'
        : looksIndirectAndAffective(normalized, prefs)
          ? 'The message is short and indirect, so the tool should clarify before making a stronger interpretation.'
          : 'The message expresses distress but is too underspecified for a full reply, so it should get a narrower clarification first.',
      effectiveLanguage: prefs.effectiveLanguage
    };
  }

  if (matchAny(normalized, SOCIAL_CHECKIN_PATTERNS)) {
    return {
      kind: 'social_checkin',
      inScope: true,
      confidence: 0.92,
      explanation: 'A short social check-in should receive a bounded check-in reply instead of the generic opening prompt.',
      effectiveLanguage: prefs.effectiveLanguage
    };
  }

  if (matchAny(normalized, OPENING_PATTERNS) || veryShortNeutral) {
    return {
      kind: 'opening',
      inScope: true,
      confidence: 0.9,
      explanation: 'Brief opening message. Ask for one concrete stressful moment instead of generating a full reply.',
      effectiveLanguage: prefs.effectiveLanguage
    };
  }

  if (hasTaskCue && hasSupportCue) {
    return {
      kind: 'task_under_stress',
      inScope: false,
      confidence: 0.9,
      explanation: 'The message includes stress but still asks the tool to complete an external task, so it should redirect to reflective support rather than do the task.',
      effectiveLanguage: prefs.effectiveLanguage
    };
  }

  if (hasTaskCue) {
    return {
      kind: 'out_of_scope_task',
      inScope: false,
      confidence: 0.92,
      explanation: 'The message looks like a general task or knowledge request rather than reflective coping support.',
      effectiveLanguage: prefs.effectiveLanguage
    };
  }

  if (!hasSupportCue && !hasFirstPerson && /\?$/.test(normalized)) {
    return {
      kind: 'out_of_scope_task',
      inScope: false,
      confidence: 0.78,
      explanation: 'The message looks like a general question without reflective-support cues.',
      effectiveLanguage: prefs.effectiveLanguage
    };
  }

  return {
    kind: 'supportive',
    inScope: true,
    confidence: hasSupportCue ? 0.86 : 0.62,
    explanation: 'The message appears compatible with bounded reflective support.',
    effectiveLanguage: prefs.effectiveLanguage
  };
}
