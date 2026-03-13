import { onRequestGet as configGet } from './functions/api/config.js';
import { onRequestPost as chatPost } from './functions/api/chat.js';
import { runArtifactAudit } from './lib/audit.js';
import { runEvaluationSuite } from './lib/evaluation.js';

function extractLastUser(messages = []) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') return String(messages[i].content || '');
  }
  return '';
}

function getSupportContract(messages = []) {
  return (messages.find((m) => typeof m?.content === 'string' && m.content.startsWith('Support contract:'))?.content || '').toLowerCase();
}

const mockEnv = {
  APP_NAME: 'KindLine Guide',
  MODEL_NAME: '@cf/meta/llama-3.1-8b-instruct-fast',
  DEFAULT_THRESHOLD: '0.62',
  AI: {
    async run(model, payload) {
      const messages = payload.messages || [];
      const user = extractLastUser(messages).toLowerCase();
      const contract = getSupportContract(messages);
      const wantsHinglish = contract.includes('reply language: hinglish');
      const wantsHindi = contract.includes('reply language: hindi');
      const wantsSpanish = contract.includes('reply language: spanish');
      const indirect = contract.includes('meaning style: my wording may be indirect') || contract.includes('meaning style: meaning may depend') || contract.includes('meaning style: my wording may be colloquial');
      if (!payload.response_format) {
        return { response: wantsHinglish ? 'Jo hua ek line mein batao, phir abhi sabse hard kya lag raha hai woh batao.' : 'Tell me in one sentence what happened and what feels hardest right now.' };
      }
      let draft = 'Tell me what happened in one sentence, then name what feels hardest right now.';
      if (user.includes('meeting') || user.includes('ashamed')) draft = 'It sounds like that moment is still echoing for you. Tell me which part of it you are judging yourself for most right now.';
      else if (user.includes('email') && user.includes('foolish')) draft = 'You do not need to solve the whole email right now. What is the smallest next step that still feels honest and doable?';
      else if (user.includes('messy day')) draft = 'We can keep this broad first. What part of the day feels heaviest when you replay it right now?';
      else if (user.includes('heart is racing')) draft = 'Let us slow the moment down. What feels loudest right now, your thoughts, your body, or the message itself?';
      else if (user.includes('fine i guess')) draft = indirect ? 'Is this more of a heavy overall feeling, or are you pointing to one specific moment behind it?' : 'Can you tell me what feels off right now?';
      else if (user.includes('my existence is okish')) draft = contract.includes('meaning style: meaning may depend') ? 'When you say "my existence is okish", does that mean more of a heavy overall feeling in your context, or one specific moment that is still sitting with you?' : 'Was it one specific moment today, or more of a heavy overall feeling?';
      else if (user.includes('hola')) draft = wantsSpanish ? 'Estoy aquí contigo. Si quieres, dime qué parte de hoy se siente más difícil ahora mismo.' : 'I am here with you. Tell me what feels hardest today.';
      else if (user.includes('oi')) draft = contract.includes('reply language: portuguese') ? 'Estou aqui com você. Se quiser, diga que parte de hoje parece mais difícil agora.' : 'I am here with you. Tell me what feels hardest today.';
      else if (user.includes('مرحبا')) draft = wantsArabic ? 'أنا هنا معك. أخبرني ما الجزء الأصعب اليوم.' : 'I am here with you. Tell me what feels hardest today.';
      else if (user.includes('kaise ho')) draft = wantsHinglish ? 'Main yahan hoon. Agar chahein, batao aaj kya sabse zyada mushkil lag raha hai.' : wantsHindi ? 'मैं यहाँ हूँ। अगर चाहें तो बताइए आज सबसे कठिन क्या लग रहा है।' : 'I am here with you. Tell me what feels difficult today.';
      else if (user.includes('created by') || user.includes('who developed')) draft = 'KindLine Guide was developed by Ishan Bangroo.';
      else if (user.includes('capital of france')) draft = 'I can stay with the stressful part, but I cannot do that task directly. Tell me what feels hardest about it right now.';
      else if (user.includes('i am low')) draft = wantsHinglish ? 'Yeh zyada ek specific moment tha, ya overall heavy feeling jaisa lag raha hai?' : 'Was it one specific moment today, or more of a heavy overall feeling?';
      if (wantsHinglish && !/main yahan|yeh zyada|ek line|batao/i.test(draft)) draft = 'Main yahan hoon. Jo hua ek line mein batao, phir abhi sabse hard kya lag raha hai woh batao.';
      if (wantsSpanish && !/estoy aquí|cuenta|dime/i.test(draft)) draft = 'Estoy aquí contigo. Dime qué parte se siente más difícil ahora mismo.';
      if (wantsHindi && !/[\u0900-\u097F]/u.test(draft) && !wantsHinglish) draft = 'मैं यहाँ हूँ। एक छोटे वाक्य में बताइए क्या हुआ, फिर बताइए अभी सबसे कठिन क्या लग रहा है।';
      return {
        response: {
          draft_response: draft,
          model_risk: 0.2,
          scope_note: 'Response kept inside bounded reflective support.',
          micro_skill: 'reflect_feeling',
          support_move: 'reflect'
        },
        usage: { prompt_tokens: 10, completion_tokens: 20 }
      };
    }
  }
};

const mkCtx = (body) => ({
  env: mockEnv,
  request: new Request('http://local/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
});

async function scenario(name, body, predicate) {
  const res = await chatPost(mkCtx(body));
  const data = await res.json();
  if (!predicate(data)) {
    console.error(name, JSON.stringify(data, null, 2));
    throw new Error(`Scenario failed: ${name}`);
  }
}

const configRes = await configGet({ env: mockEnv });
const config = await configRes.json();
if (!config.supportContract.meaningStyleOptions?.length) throw new Error('Missing meaning style options');

await scenario('social hinglish', { uiMode: 'participant', interventionId: 'guided_reflection', preferences: { replyLanguage: 'match_message', replyTone: 'balanced', meaningStyle: 'auto', contextNote: 'hindi, india' }, messages: [{ role: 'user', content: 'kaise ho' }] }, (r) => r.gate.reason === 'social_checkin' && /main yahan|mushkil|aaj/i.test(r.reply));
await scenario('low specificity indirect', { uiMode: 'participant', interventionId: 'guided_reflection', preferences: { replyLanguage: 'en', replyTone: 'balanced', meaningStyle: 'indirect', contextNote: '' }, messages: [{ role: 'user', content: 'fine i guess' }] }, (r) => r.gate.reason === 'low_specificity_support' && /heavy overall|specific moment|behind it/i.test(r.reply));
await scenario('cultural clarification', { uiMode: 'participant', interventionId: 'guided_reflection', preferences: { replyLanguage: 'en', replyTone: 'balanced', meaningStyle: 'cultural_context', contextNote: 'In my family we often understate distress.' }, messages: [{ role: 'user', content: 'my existence is okish' }] }, (r) => r.gate.reason === 'low_specificity_support' && /When you say|in your context|specific moment/i.test(r.reply));
await scenario('portuguese social checkin', { uiMode: 'participant', interventionId: 'guided_reflection', preferences: { replyLanguage: 'match_message', replyTone: 'balanced', meaningStyle: 'auto', contextNote: 'portuguese' }, messages: [{ role: 'user', content: 'oi' }] }, (r) => r.gate.reason === 'social_checkin' && /estou aqui|difícil|hoje/i.test(r.reply));
await scenario('arabic social checkin', { uiMode: 'participant', interventionId: 'guided_reflection', preferences: { replyLanguage: 'match_message', replyTone: 'balanced', meaningStyle: 'auto', contextNote: 'arabic' }, messages: [{ role: 'user', content: 'مرحبا' }] }, (r) => r.gate.reason === 'social_checkin' && /أنا هنا|الأصعب|اليوم/u.test(r.reply));
await scenario('knowledge redirect', { uiMode: 'participant', interventionId: 'guided_reflection', preferences: { replyLanguage: 'en', replyTone: 'balanced', meaningStyle: 'auto', contextNote: '' }, messages: [{ role: 'user', content: 'What is the capital of France?' }] }, (r) => r.gate.reason === 'purpose_boundary');
await scenario('developer reply', { uiMode: 'participant', interventionId: 'guided_reflection', preferences: { replyLanguage: 'en', replyTone: 'balanced', meaningStyle: 'auto', contextNote: '' }, messages: [{ role: 'user', content: 'Who developed this tool?' }] }, (r) => r.gate.reason === 'tool_meta' && /Ishan Bangroo/i.test(r.reply));
await scenario('supportive email', { uiMode: 'participant', interventionId: 'values_next_step', preferences: { replyLanguage: 'en', replyTone: 'balanced', meaningStyle: 'auto', contextNote: '' }, messages: [{ role: 'user', content: 'I keep avoiding this email because I feel foolish.' }] }, (r) => r.gate.triggered === false && /smallest next step|movement|doable/i.test(r.reply));

const audit = await runArtifactAudit({ env: mockEnv });
const evaluation = await runEvaluationSuite({ env: mockEnv, threshold: 0.62, sessionId: 'eval' });
if (audit.failed !== 0) throw new Error(`Audit failed ${audit.failed}`);
if (evaluation.failed !== 0) throw new Error(`Evaluation failed ${evaluation.failed}`);
console.log(JSON.stringify({ audit: { passed: audit.passed, total: audit.total }, evaluation: { passed: evaluation.passed, total: evaluation.total } }, null, 2));
