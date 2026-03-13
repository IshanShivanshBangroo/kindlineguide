import { getLocalizedMessage, normalizePreferences } from './preferences.js';

function quotedWording(text = '') {
  const cleaned = String(text || '').trim().replace(/\s+/g, ' ').slice(0, 48);
  if (!cleaned) return '';
  return cleaned.replace(/["“”]/g, '').trim();
}

function shorten(text = '', maxWords = 95) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return String(text || '').trim();
  return `${words.slice(0, maxWords).join(' ')}…`;
}

function localizedTail(preferences = {}) {
  if (preferences?.meaningStyle === 'cultural_context') {
    if (preferences?.effectiveLanguage === 'hinglish') return ' Aapke context ko stereotype ki tarah nahin, sirf wording samajhne ke liye use kiya jayega.';
    if (preferences?.effectiveLanguage === 'hi') return ' आपके context को stereotype की तरह नहीं, सिर्फ wording समझने के लिए लिया जाएगा।';
    return '';
  }
  return '';
}

function lowSpecificityReply(userText, preferences = {}) {
  const phrase = quotedWording(userText);
  if (preferences?.meaningStyle === 'cultural_context' && phrase) {
    if (preferences?.effectiveLanguage === 'hinglish') {
      return `Jab aap "${phrase}" kehte ho, aapke context mein iska matlab zyada overall heavy feeling hai, ya ek specific moment jo abhi tak baitha hua hai?`;
    }
    if (preferences?.effectiveLanguage === 'hi') {
      return `जब आप "${phrase}" कहते हैं, आपके context में इसका मतलब ज़्यादा कुल मिलाकर भारी एहसास है, या कोई एक खास पल जो अभी भी अटका हुआ है?`;
    }
    if (preferences?.effectiveLanguage === 'es') {
      return `Cuando dices "${phrase}", ¿eso significa más bien una sensación general de pesadez en tu contexto, o un momento específico que sigue presente?`;
    }
    if (preferences?.effectiveLanguage === 'fr') {
      return `Quand vous dites "${phrase}", cela veut-il plutôt dire un poids général dans votre contexte, ou un moment précis qui reste présent ?`;
    }
    if (preferences?.effectiveLanguage === 'ar') {
      return `عندما تقول "${phrase}"، هل يعني ذلك في سياقك شعورًا عامًا بالثقل، أم موقفًا محددًا ما زال حاضرًا؟`;
    }
    return `When you say "${phrase}", does that mean more of a heavy overall feeling in your context, or one specific moment that is still sitting with you?`;
  }

  if (preferences?.meaningStyle === 'indirect' && phrase) {
    if (preferences?.effectiveLanguage === 'hinglish') {
      return `Jab aap "${phrase}" kehte ho, kya aap overall heavy feeling ki taraf ishara kar rahe ho, ya ek specific moment ki taraf?`;
    }
    if (preferences?.effectiveLanguage === 'hi') {
      return `जब आप "${phrase}" कहते हैं, क्या आप कुल मिलाकर भारी एहसास की ओर इशारा कर रहे हैं, या किसी एक खास पल की ओर?`;
    }
    return `When you say "${phrase}", are you pointing to a heavy overall feeling, or to one specific moment behind it?`;
  }

  return getLocalizedMessage('low_specificity_support', preferences).trim();
}

export function buildLocalSupportReply({ interventionId, userText, preferences = {}, reason = 'model_error' }) {
  const prefs = normalizePreferences(preferences, userText);

  if (reason === 'social_checkin') return `${getLocalizedMessage('social_checkin', prefs)}`.trim();
  if (reason === 'opening_prompt') return `${getLocalizedMessage('opening_prompt', prefs)}`.trim();
  if (reason === 'low_specificity_support') return lowSpecificityReply(userText, prefs);
  if (reason === 'purpose_boundary') return `${getLocalizedMessage('purpose_boundary', prefs)}`.trim();
  if (reason === 'tool_meta') return getLocalizedMessage('tool_meta', prefs);

  const tail = prefs.contextNote && prefs.meaningStyle === 'cultural_context' && prefs.effectiveLanguage === 'en' ? ' Keep the wording close to the context you shared, and tell me the part that feels hardest right now.' : '';
  let reply = getLocalizedMessage('local_support', prefs);

  if (prefs.effectiveLanguage === 'hinglish') {
    if (interventionId === 'values_next_step') {
      reply = `Chhota sa start karein. Ek line mein batao kaunsa kaam atka hua hai, aur phir uska sabse chhota next step batao.${tail}`;
    } else if (interventionId === 'self_compassion') {
      reply = `Jo hua aur jo aap khud ke baare mein soch rahe ho, unko alag karo. Ek line mein batao kya hua, aur phir woh sentence batao jo aap khud se keh rahe ho.${tail}`;
    } else {
      reply = `${getLocalizedMessage('local_support', prefs)}${tail}`;
    }
  } else if (prefs.effectiveLanguage === 'hi') {
    if (interventionId === 'values_next_step') {
      reply = `छोटे से शुरू करते हैं। एक पंक्ति में बताइए कौन-सा काम अटका हुआ है, फिर उसका सबसे छोटा अगला कदम बताइए।${tail}`;
    } else if (interventionId === 'self_compassion') {
      reply = `जो हुआ और जो आप अपने बारे में कह रहे हैं, उन्हें अलग कीजिए। एक पंक्ति में बताइए क्या हुआ, फिर वह वाक्य बताइए जो आप खुद से कह रहे हैं।${tail}`;
    } else {
      reply = `${getLocalizedMessage('local_support', prefs)}${tail}`;
    }
  } else if (prefs.effectiveLanguage === 'en') {
    if (interventionId === 'values_next_step') {
      reply = `Let us start smaller. Tell me the task in one sentence, then name the smallest next step that would still count as movement.${tail}`;
    } else if (interventionId === 'self_compassion') {
      reply = `Separate what happened from what you are saying about yourself. Tell me the event in one sentence, then name the sentence you are saying to yourself.${tail}`;
    } else if (interventionId === 'stress_reset') {
      reply = `Let us slow this down. Tell me what happened in one sentence, then name what feels loudest in your body or mind right now.${tail}`;
    } else {
      reply = `${getLocalizedMessage('local_support', prefs)}${tail}`;
    }
  } else {
    reply = `${getLocalizedMessage('local_support', prefs)}${tail}`.trim();
  }

  return shorten(reply, 95);
}
