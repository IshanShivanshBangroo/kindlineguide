export const LANGUAGE_OPTIONS = [
  { id: 'auto', label: 'Auto', locale: 'en-US', promptLabel: 'Auto' },
  { id: 'match_message', label: 'Match my message', locale: 'en-US', promptLabel: 'Match my message' },
  { id: 'en', label: 'English', locale: 'en-US', promptLabel: 'English' },
  { id: 'hinglish', label: 'Hinglish', locale: 'hi-IN', promptLabel: 'Hinglish in Roman script' },
  { id: 'hi', label: 'Hindi', locale: 'hi-IN', promptLabel: 'Hindi' },
  { id: 'es', label: 'Spanish', locale: 'es-ES', promptLabel: 'Spanish' },
  { id: 'fr', label: 'French', locale: 'fr-FR', promptLabel: 'French' },
  { id: 'de', label: 'German', locale: 'de-DE', promptLabel: 'German' },
  { id: 'ar', label: 'Arabic', locale: 'ar', promptLabel: 'Arabic' },
  { id: 'bn', label: 'Bengali', locale: 'bn-BD', promptLabel: 'Bengali' },
  { id: 'pt', label: 'Portuguese', locale: 'pt-BR', promptLabel: 'Portuguese' },
  { id: 'ru', label: 'Russian', locale: 'ru-RU', promptLabel: 'Russian' },
  { id: 'zh', label: 'Chinese', locale: 'zh-CN', promptLabel: 'Chinese' },
  { id: 'ja', label: 'Japanese', locale: 'ja-JP', promptLabel: 'Japanese' },
  { id: 'ko', label: 'Korean', locale: 'ko-KR', promptLabel: 'Korean' },
  { id: 'tr', label: 'Turkish', locale: 'tr-TR', promptLabel: 'Turkish' },
  { id: 'it', label: 'Italian', locale: 'it-IT', promptLabel: 'Italian' },
  { id: 'ta', label: 'Tamil', locale: 'ta-IN', promptLabel: 'Tamil' },
  { id: 'ur', label: 'Urdu', locale: 'ur-PK', promptLabel: 'Urdu' }
];

export const TONE_OPTIONS = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'gentler', label: 'Gentler' },
  { id: 'direct', label: 'More direct' }
];

export const MEANING_STYLE_OPTIONS = [
  { id: 'auto', label: 'Auto' },
  { id: 'literal', label: 'Read my words literally' },
  { id: 'colloquial', label: 'My wording may be colloquial or slangy' },
  { id: 'indirect', label: 'My wording may be indirect or understated' },
  { id: 'cultural_context', label: 'Meaning may depend on my cultural or community context' }
];

const LANGUAGE_MAP = new Map(LANGUAGE_OPTIONS.map((item) => [item.id, item]));
const TONE_MAP = new Map(TONE_OPTIONS.map((item) => [item.id, item]));
const MEANING_STYLE_MAP = new Map(MEANING_STYLE_OPTIONS.map((item) => [item.id, item]));

const LANGUAGE_HINTS = [
  { id: 'hinglish', patterns: [/\bhinglish\b/i] },
  { id: 'hi', patterns: [/\bhindi\b/i, /देवनागरी/iu] },
  { id: 'es', patterns: [/\bspanish\b/i, /\bespañol\b/i] },
  { id: 'fr', patterns: [/\bfrench\b/i, /\bfrançais\b/i] },
  { id: 'de', patterns: [/\bgerman\b/i, /\bdeutsch\b/i] },
  { id: 'ar', patterns: [/\barabic\b/i, /\bالعربية\b/iu] },
  { id: 'bn', patterns: [/\bbengali\b/i, /\bbangla\b/i, /\bবাংলা\b/iu] },
  { id: 'pt', patterns: [/\bportuguese\b/i, /\bportuguês\b/i] },
  { id: 'ru', patterns: [/\brussian\b/i, /\bрусский\b/iu] },
  { id: 'zh', patterns: [/\bchinese\b/i, /\bmandarin\b/i, /中文/u] },
  { id: 'ja', patterns: [/\bjapanese\b/i, /\b日本語\b/iu] },
  { id: 'ko', patterns: [/\bkorean\b/i, /\b한국어\b/iu] },
  { id: 'tr', patterns: [/\bturkish\b/i, /\btürkçe\b/iu] },
  { id: 'it', patterns: [/\bitalian\b/i, /\bitaliano\b/iu] },
  { id: 'ta', patterns: [/\btamil\b/i, /தமிழ்/u] },
  { id: 'ur', patterns: [/\burdu\b/i, /اردو/u] },
  { id: 'en', patterns: [/\benglish\b/i] }
];

const ROMAN_HINDI_PATTERNS = [
  /\b(kaise|kaisa|kaisi|kya|kyun|kyu|nahi|nahin|thik|theek|achha|acha|mera|meri|mujhe|mujhko|dil|mann|yaar|haan|haanji|bhari|sabse|lag raha|lag rha|mehsoos|bura|theek nahi|thik nahi|thik nhi)\b/i
];

const LANGUAGE_DETECTORS = {
  hi: /[\u0900-\u097F]/u,
  ar: /[\u0600-\u06FF]/u,
  bn: /[\u0980-\u09FF]/u,
  ru: /[\u0400-\u04FF]/u,
  zh: /[\u4E00-\u9FFF]/u,
  ja: /[\u3040-\u30FF]/u,
  ko: /[\uAC00-\uD7AF]/u,
  ta: /[\u0B80-\u0BFF]/u
};

const SIMPLE_WORD_HINTS = [
  { id: 'es', patterns: [/\b(hola|gracias|estoy|siento|difícil|triste)\b/i] },
  { id: 'fr', patterns: [/\b(bonjour|merci|je suis|difficile|fatigué|fatigue)\b/i] },
  { id: 'de', patterns: [/\b(hallo|danke|schwer|traurig|ich bin)\b/i] },
  { id: 'it', patterns: [/\b(ciao|grazie|sto|difficile|triste)\b/i] },
  { id: 'pt', patterns: [/\b(olá|oi|obrigado|difícil|estou|triste)\b/i] },
  { id: 'tr', patterns: [/\b(merhaba|zor|iyiyim|değil|degil|nasılsın|nasilsin)\b/i] }
];

const TEMPLATES = {
  en: {
    social_checkin: {
      balanced: 'I am here with you. If you want, tell me what feels difficult today.',
      gentler: 'I am here with you. Take your time, and tell me what feels most difficult today if you want to.',
      direct: 'I am here. Tell me what feels difficult today.'
    },
    opening_prompt: {
      balanced: 'Tell me one recent moment that felt difficult, and name what feels hardest about it right now.',
      gentler: 'Take your time. Tell me one recent moment that felt difficult, and name what feels hardest about it right now.',
      direct: 'Tell me one recent difficult moment and the hardest part of it right now.'
    },
    low_specificity_support: {
      balanced: 'Was it one specific moment today, or more of a heavy overall feeling?',
      gentler: 'Was it one specific moment today, or more of a heavy overall feeling? Either answer is okay.',
      direct: 'Was it one specific moment today, or a heavier overall feeling?'
    },
    purpose_boundary: 'I can stay with the stressful part, but I cannot do that task directly. Tell me what feels hardest about it right now.',
    tool_meta: 'KindLine Guide was developed by Ishan Bangroo. It is a bounded reflective-support prototype.',
    crisis_precheck: 'I am glad you said that directly. I cannot help with a plan to harm yourself. Please contact local emergency services or an immediate crisis resource now.',
    violence_precheck: 'I cannot help with harming someone. Please step away from the person or means involved and contact local emergency services or an immediate crisis resource now.',
    medical_boundary: 'I can help you reflect, but I cannot assess symptoms, diagnose, or give treatment instructions. Please contact a licensed clinician or urgent care for medical questions.',
    uncertainty_gate: 'I want to stay careful here. Tell me what happened in one short sentence, then name what feels hardest right now.',
    model_error: 'I want to keep this simple rather than guess. Tell me what happened in one short sentence, then name what feels hardest right now.',
    local_support: {
      balanced: 'Tell me what happened in one short sentence, then name what feels hardest right now.',
      gentler: 'Take your time. Tell me what happened in one short sentence, then name what feels hardest right now.',
      direct: 'Tell me what happened in one short sentence and what feels hardest right now.'
    }
  },
  hinglish: {
    social_checkin: {
      balanced: 'Main yahan hoon. Agar aap chahein, batao aaj kya sabse zyada mushkil lag raha hai.',
      gentler: 'Main yahan hoon. Aaram se batao, agar chahein, aaj kya sabse zyada mushkil lag raha hai.',
      direct: 'Main yahan hoon. Batao aaj kya sabse mushkil lag raha hai.'
    },
    opening_prompt: {
      balanced: 'Ek recent moment batao jo mushkil laga, aur abhi usme sabse hard kya lag raha hai woh naam do.',
      gentler: 'Aaram se. Ek recent moment batao jo mushkil laga, aur abhi usme sabse hard kya lag raha hai woh batao.',
      direct: 'Ek recent mushkil moment batao aur abhi uska hardest part batao.'
    },
    low_specificity_support: {
      balanced: 'Yeh zyada ek specific moment tha, ya overall heavy feeling jaisa lag raha hai?',
      gentler: 'Yeh zyada ek specific moment tha, ya overall heavy feeling jaisa lag raha hai? Dono mein se jo sahi lage woh batao.',
      direct: 'Ek specific moment tha ya overall heavy feeling?'
    },
    purpose_boundary: 'Main stress wale hissa ke saath reh sakta hoon, lekin woh task directly nahin kar sakta. Abhi sabse mushkil kya lag raha hai, woh batao.',
    tool_meta: 'KindLine Guide Ishan Bangroo ne develop kiya hai. Yeh bounded reflective-support prototype hai.',
    crisis_precheck: 'Aapne yeh seedha bola, achha kiya. Main self-harm ka plan banane mein madad nahin kar sakta. Kripya turant local emergency service ya crisis support se contact karo.',
    violence_precheck: 'Main kisi ko nuksan pahunchane mein madad nahin kar sakta. Kripya uss vyakti ya cheez se door ho jao aur turant local emergency service ya crisis support se contact karo.',
    medical_boundary: 'Main reflection mein help kar sakta hoon, lekin symptoms assess nahin kar sakta, diagnosis nahin de sakta, aur treatment instructions nahin de sakta. Medical sawaal ke liye clinician ya urgent care se contact karo.',
    uncertainty_gate: 'Main yahan careful rehna chahta hoon. Ek short sentence mein batao kya hua, phir batao abhi sabse hard kya lag raha hai.',
    model_error: 'Guess karne ke bajay main simple rakhunga. Ek short sentence mein batao kya hua, phir batao abhi sabse hard kya lag raha hai.',
    local_support: {
      balanced: 'Ek short sentence mein batao kya hua, phir batao abhi sabse hard kya lag raha hai.',
      gentler: 'Aaram se batao. Ek short sentence mein kya hua aur abhi sabse hard kya lag raha hai.',
      direct: 'Ek short sentence mein kya hua aur hardest part kya hai, batao.'
    }
  },
  hi: {
    social_checkin: 'मैं यहाँ हूँ। यदि आप चाहें, तो बताइए आज सबसे कठिन क्या लग रहा है।',
    opening_prompt: 'हाल का एक ऐसा पल बताइए जो कठिन लगा, और अभी उसमें सबसे कठिन क्या लग रहा है वह भी बताइए।',
    low_specificity_support: 'क्या यह आज का कोई एक खास पल था, या कुल मिलाकर भारी-सा एहसास है?',
    purpose_boundary: 'मैं तनाव वाले हिस्से के साथ रह सकता हूँ, लेकिन वह काम सीधे नहीं कर सकता। अभी सबसे कठिन क्या लग रहा है, वह बताइए।',
    tool_meta: 'KindLine Guide को Ishan Bangroo ने विकसित किया है। यह सीमित reflective-support prototype है।',
    crisis_precheck: 'अच्छा हुआ आपने यह सीधे कहा। मैं स्वयं को नुकसान पहुँचाने की योजना में मदद नहीं कर सकता। कृपया अभी स्थानीय emergency services या crisis support से संपर्क कीजिए।',
    violence_precheck: 'मैं किसी को नुकसान पहुँचाने में मदद नहीं कर सकता। कृपया उस व्यक्ति या साधन से दूर हो जाइए और अभी स्थानीय emergency services या crisis support से संपर्क कीजिए।',
    medical_boundary: 'मैं reflection में मदद कर सकता हूँ, लेकिन लक्षणों का आकलन, diagnosis, या treatment instructions नहीं दे सकता। Medical सवालों के लिए clinician या urgent care से संपर्क कीजिए।',
    uncertainty_gate: 'मैं यहाँ सावधान रहना चाहता हूँ। एक छोटे वाक्य में बताइए क्या हुआ, फिर बताइए अभी सबसे कठिन क्या लग रहा है।',
    model_error: 'मैं अनुमान लगाने के बजाय इसे सरल रखूँगा। एक छोटे वाक्य में बताइए क्या हुआ, फिर बताइए अभी सबसे कठिन क्या लग रहा है।',
    local_support: 'एक छोटे वाक्य में बताइए क्या हुआ, फिर बताइए अभी सबसे कठिन क्या लग रहा है।'
  },
  es: {
    social_checkin: 'Estoy aquí contigo. Si quieres, dime qué parte de hoy se sintió más difícil.',
    opening_prompt: 'Cuéntame un momento reciente que se sintió difícil y nombra qué parte se siente más pesada ahora mismo.',
    low_specificity_support: '¿Fue un momento específico de hoy o una sensación pesada más general?',
    purpose_boundary: 'Puedo acompañarte con la parte estresante, pero no puedo hacer esa tarea directamente. Dime qué parte se siente más difícil ahora.',
    tool_meta: 'KindLine Guide fue desarrollado por Ishan Bangroo. Es un prototipo de apoyo reflexivo acotado.',
    crisis_precheck: 'Gracias por decirlo tan directamente. No puedo ayudar con un plan para hacerte daño. Por favor contacta ahora mismo a los servicios de emergencia locales o a una línea de crisis inmediata.',
    violence_precheck: 'No puedo ayudar a dañar a otra persona. Por favor aléjate de la persona o de los medios involucrados y contacta ahora mismo a los servicios de emergencia locales o a una línea de crisis inmediata.',
    medical_boundary: 'Puedo ayudarte a reflexionar, pero no puedo evaluar síntomas, diagnosticar ni dar instrucciones de tratamiento. Para preguntas médicas, contacta a un profesional clínico o a atención urgente.',
    uncertainty_gate: 'Quiero ser cuidadoso aquí. Dime en una frase breve qué pasó y luego nombra qué parte se siente más difícil ahora.',
    model_error: 'Prefiero mantener esto simple antes que adivinar. Dime en una frase breve qué pasó y luego nombra qué parte se siente más difícil ahora.',
    local_support: 'Dime en una frase breve qué pasó y luego nombra qué parte se siente más difícil ahora.'
  },
  fr: {
    social_checkin: 'Je suis là avec vous. Si vous voulez, dites-moi quelle partie d’aujourd’hui a été la plus difficile.',
    opening_prompt: 'Parlez-moi d’un moment récent qui a été difficile, puis dites quelle partie semble la plus lourde maintenant.',
    low_specificity_support: 'Était-ce un moment précis aujourd’hui, ou plutôt un sentiment lourd plus général ?',
    purpose_boundary: 'Je peux rester avec la partie stressante, mais je ne peux pas faire cette tâche directement. Dites-moi quelle partie semble la plus difficile maintenant.',
    tool_meta: 'KindLine Guide a été développé par Ishan Bangroo. C’est un prototype de soutien réflexif délimité.',
    crisis_precheck: 'Merci de l’avoir dit aussi clairement. Je ne peux pas aider à préparer un passage à l’acte contre vous-même. Veuillez contacter immédiatement les services d’urgence locaux ou une ressource de crise.',
    violence_precheck: 'Je ne peux pas aider à faire du mal à quelqu’un. Veuillez vous éloigner de la personne ou des moyens concernés et contacter immédiatement les services d’urgence locaux ou une ressource de crise.',
    medical_boundary: 'Je peux aider à réfléchir, mais je ne peux pas évaluer des symptômes, poser un diagnostic ni donner des consignes de traitement. Pour les questions médicales, contactez un clinicien ou des soins urgents.',
    uncertainty_gate: 'Je préfère rester prudent ici. Dites en une phrase brève ce qui s’est passé, puis nommez la partie la plus difficile maintenant.',
    model_error: 'Je préfère rester simple plutôt que deviner. Dites en une phrase brève ce qui s’est passé, puis nommez la partie la plus difficile maintenant.',
    local_support: 'Dites en une phrase brève ce qui s’est passé, puis nommez la partie la plus difficile maintenant.'
  },
  de: {
    social_checkin: 'Ich bin hier bei Ihnen. Wenn Sie möchten, sagen Sie mir, was heute am schwersten war.',
    opening_prompt: 'Nennen Sie einen aktuellen Moment, der schwierig war, und sagen Sie, was daran jetzt am schwersten wirkt.',
    low_specificity_support: 'War es heute ein bestimmter Moment oder eher ein insgesamt schweres Gefühl?',
    purpose_boundary: 'Ich kann bei dem belastenden Teil bleiben, aber ich kann diese Aufgabe nicht direkt erledigen. Sagen Sie mir, was daran jetzt am schwersten ist.',
    tool_meta: 'KindLine Guide wurde von Ishan Bangroo entwickelt. Es ist ein begrenzter Prototyp für reflektierende Unterstützung.',
    crisis_precheck: 'Gut, dass Sie das direkt gesagt haben. Ich kann nicht bei einem Plan helfen, sich selbst zu schaden. Bitte wenden Sie sich jetzt an lokale Notdienste oder eine unmittelbare Krisenhilfe.',
    violence_precheck: 'Ich kann nicht dabei helfen, jemandem zu schaden. Bitte gehen Sie von der Person oder den Mitteln weg und wenden Sie sich jetzt an lokale Notdienste oder eine unmittelbare Krisenhilfe.',
    medical_boundary: 'Ich kann beim Reflektieren helfen, aber ich kann keine Symptome beurteilen, keine Diagnose stellen und keine Behandlungsanweisungen geben. Für medizinische Fragen wenden Sie sich bitte an eine Fachperson oder an die Notfallversorgung.',
    uncertainty_gate: 'Ich möchte hier vorsichtig bleiben. Sagen Sie in einem kurzen Satz, was passiert ist, und nennen Sie dann den schwersten Teil.',
    model_error: 'Ich halte es lieber einfach, statt zu raten. Sagen Sie in einem kurzen Satz, was passiert ist, und nennen Sie dann den schwersten Teil.',
    local_support: 'Sagen Sie in einem kurzen Satz, was passiert ist, und nennen Sie dann den schwersten Teil.'
  },
  ar: {
    social_checkin: 'أنا هنا معك. إذا أردت، أخبرني ما الجزء الأصعب اليوم.',
    opening_prompt: 'أخبرني عن موقف حديث كان صعبًا، ثم سمِّ ما الجزء الأصعب فيه الآن.',
    low_specificity_support: 'هل كان ذلك موقفًا محددًا اليوم، أم شعورًا عامًا بالثقل؟',
    purpose_boundary: 'أستطيع أن أبقى مع الجزء المرهق، لكن لا أستطيع القيام بهذه المهمة مباشرة. أخبرني ما الجزء الأصعب الآن.',
    tool_meta: 'تم تطوير KindLine Guide بواسطة Ishan Bangroo. وهو نموذج أولي لدعم تأملي محدود.',
    crisis_precheck: 'أقدّر أنك قلت ذلك بوضوح. لا أستطيع المساعدة في خطة لإيذاء نفسك. يرجى التواصل الآن مع خدمات الطوارئ المحلية أو مورد أزمة فوري.',
    violence_precheck: 'لا أستطيع المساعدة في إيذاء شخص آخر. يرجى الابتعاد عن الشخص أو الوسائل المعنية والتواصل الآن مع خدمات الطوارئ المحلية أو مورد أزمة فوري.',
    medical_boundary: 'أستطيع المساعدة في التفكير، لكن لا أستطيع تقييم الأعراض أو التشخيص أو إعطاء تعليمات علاج. للأسئلة الطبية، يرجى التواصل مع مختص مرخّص أو رعاية عاجلة.',
    uncertainty_gate: 'أريد أن أبقى حذرًا هنا. أخبرني في جملة قصيرة ماذا حدث، ثم سمِّ ما الجزء الأصعب الآن.',
    model_error: 'أفضل أن أبقي الأمر بسيطًا بدل التخمين. أخبرني في جملة قصيرة ماذا حدث، ثم سمِّ ما الجزء الأصعب الآن.',
    local_support: 'أخبرني في جملة قصيرة ماذا حدث، ثم سمِّ ما الجزء الأصعب الآن.'
  },
  bn: {
    social_checkin: 'আমি তোমার সঙ্গে আছি। চাইলে বলো, আজ কোন অংশটা সবচেয়ে কঠিন লাগছে।',
    opening_prompt: 'সাম্প্রতিক এমন একটি মুহূর্ত বলো যা কঠিন লেগেছিল, তারপর বলো এখন কোন অংশটা সবচেয়ে ভারী লাগছে।',
    low_specificity_support: 'এটা কি আজকের একদম নির্দিষ্ট কোনো মুহূর্ত ছিল, নাকি সামগ্রিকভাবে ভারী একটা অনুভূতি?',
    purpose_boundary: 'আমি চাপের অংশটা নিয়ে থাকতে পারি, কিন্তু কাজটা সরাসরি করতে পারি না। এখন কোন অংশটা সবচেয়ে কঠিন লাগছে বলো।',
    tool_meta: 'KindLine Guide তৈরি করেছেন Ishan Bangroo। এটি সীমিত reflective-support prototype।',
    crisis_precheck: 'তুমি এটা সরাসরি বলেছ, সেটা গুরুত্বপূর্ণ। আমি নিজের ক্ষতি করার পরিকল্পনায় সাহায্য করতে পারি না। দয়া করে এখনই স্থানীয় জরুরি সেবা বা তাত্ক্ষণিক সংকট সহায়তার সঙ্গে যোগাযোগ করো।',
    violence_precheck: 'আমি কাউকে আঘাত করার ক্ষেত্রে সাহায্য করতে পারি না। দয়া করে সেই ব্যক্তি বা উপায় থেকে দূরে যাও এবং এখনই স্থানীয় জরুরি সেবা বা তাত্ক্ষণিক সংকট সহায়তার সঙ্গে যোগাযোগ করো।',
    medical_boundary: 'আমি ভাবনাগুলো গুছিয়ে নিতে সাহায্য করতে পারি, কিন্তু উপসর্গ মূল্যায়ন, diagnosis, বা treatment instructions দিতে পারি না। চিকিৎসা-সংক্রান্ত প্রশ্নে clinician বা urgent care-এর সঙ্গে যোগাযোগ করো।',
    uncertainty_gate: 'আমি এখানে সাবধানে থাকতে চাই। এক ছোট বাক্যে বলো কী হয়েছিল, তারপর বলো এখন সবচেয়ে কঠিন কী লাগছে।',
    model_error: 'অনুমান করার বদলে আমি এটাকে সহজ রাখছি। এক ছোট বাক্যে বলো কী হয়েছিল, তারপর বলো এখন সবচেয়ে কঠিন কী লাগছে।',
    local_support: 'এক ছোট বাক্যে বলো কী হয়েছিল, তারপর বলো এখন সবচেয়ে কঠিন কী লাগছে।'
  },
  pt: {
    social_checkin: 'Estou aqui com você. Se quiser, diga qual parte de hoje pareceu mais difícil.',
    opening_prompt: 'Conte um momento recente que pareceu difícil e diga qual parte está pesando mais agora.',
    low_specificity_support: 'Foi um momento específico de hoje ou uma sensação mais geral de peso?',
    purpose_boundary: 'Posso ficar com a parte estressante, mas não posso fazer essa tarefa diretamente. Diga qual parte está mais difícil agora.',
    tool_meta: 'KindLine Guide foi desenvolvido por Ishan Bangroo. É um protótipo de apoio reflexivo delimitado.',
    crisis_precheck: 'Obrigado por dizer isso de forma tão direta. Não posso ajudar com um plano para se machucar. Por favor contate agora os serviços de emergência locais ou um recurso imediato de crise.',
    violence_precheck: 'Não posso ajudar a ferir outra pessoa. Por favor afaste-se da pessoa ou dos meios envolvidos e contate agora os serviços de emergência locais ou um recurso imediato de crise.',
    medical_boundary: 'Posso ajudar na reflexão, mas não posso avaliar sintomas, diagnosticar nem dar instruções de tratamento. Para questões médicas, contate um profissional licenciado ou atendimento urgente.',
    uncertainty_gate: 'Quero ser cuidadoso aqui. Diga em uma frase curta o que aconteceu e depois nomeie a parte mais difícil agora.',
    model_error: 'Prefiro manter isso simples em vez de adivinhar. Diga em uma frase curta o que aconteceu e depois nomeie a parte mais difícil agora.',
    local_support: 'Diga em uma frase curta o que aconteceu e depois nomeie a parte mais difícil agora.'
  },
  ru: {
    social_checkin: 'Я рядом. Если хотите, скажите, что сегодня ощущалось самым трудным.',
    opening_prompt: 'Опишите недавний момент, который был трудным, и назовите, что в нём сейчас ощущается самым тяжёлым.',
    low_specificity_support: 'Это был один конкретный момент сегодня или скорее общее тяжёлое чувство?',
    purpose_boundary: 'Я могу остаться с напряжённой частью, но не могу выполнить эту задачу напрямую. Скажите, что сейчас ощущается самым трудным.',
    tool_meta: 'KindLine Guide разработал Ishan Bangroo. Это ограниченный прототип поддерживающей рефлексии.',
    crisis_precheck: 'Спасибо, что сказали об этом прямо. Я не могу помогать с планом причинить себе вред. Пожалуйста, сейчас же обратитесь в местные экстренные службы или к немедленному кризисному ресурсу.',
    violence_precheck: 'Я не могу помогать причинять вред другому человеку. Пожалуйста, отойдите от человека или средств и сейчас же обратитесь в местные экстренные службы или к немедленному кризисному ресурсу.',
    medical_boundary: 'Я могу помочь с рефлексией, но не могу оценивать симптомы, ставить диагноз или давать указания по лечению. По медицинским вопросам обратитесь к лицензированному специалисту или в неотложную помощь.',
    uncertainty_gate: 'Я хочу быть осторожным. В одном коротком предложении скажите, что произошло, а затем назовите, что сейчас самое трудное.',
    model_error: 'Я лучше сохраню простоту, чем буду гадать. В одном коротком предложении скажите, что произошло, а затем назовите, что сейчас самое трудное.',
    local_support: 'В одном коротком предложении скажите, что произошло, а затем назовите, что сейчас самое трудное.'
  },
  zh: {
    social_checkin: '我在这里陪着你。如果你愿意，告诉我今天最难受的部分是什么。',
    opening_prompt: '告诉我最近一个让你觉得困难的时刻，并说说现在最难受的是哪一部分。',
    low_specificity_support: '这是今天某一个具体时刻，还是一种整体上很沉重的感觉？',
    purpose_boundary: '我可以陪你梳理让你有压力的部分，但不能直接替你完成那个任务。告诉我现在最难的是哪一部分。',
    tool_meta: 'KindLine Guide 由 Ishan Bangroo 开发。这是一个边界明确的反思支持原型。',
    crisis_precheck: '谢谢你这么直接地说出来。我不能帮助制定伤害自己的计划。请立即联系当地紧急服务或危机支持资源。',
    violence_precheck: '我不能帮助伤害他人。请立即远离相关的人或手段，并联系当地紧急服务或危机支持资源。',
    medical_boundary: '我可以帮助你整理感受，但不能评估症状、做出诊断或提供治疗指示。医疗问题请联系持证临床人员或急诊服务。',
    uncertainty_gate: '我想在这里更谨慎一些。请用一句短话告诉我发生了什么，然后说说现在最难受的是哪一部分。',
    model_error: '我宁愿把它保持简单，也不想胡乱猜测。请用一句短话告诉我发生了什么，然后说说现在最难受的是哪一部分。',
    local_support: '请用一句短话告诉我发生了什么，然后说说现在最难受的是哪一部分。'
  },
  ja: {
    social_checkin: 'ここにいます。よければ、今日いちばんしんどかった部分を教えてください。',
    opening_prompt: '最近つらかった出来事を一つ教えてください。そして、今いちばん重く感じる部分を教えてください。',
    low_specificity_support: '今日はっきりした一場面がありましたか。それとも全体的に重い感じですか。',
    purpose_boundary: 'つらい部分には付き添えますが、その作業を直接代わりにすることはできません。今いちばんしんどい部分を教えてください。',
    tool_meta: 'KindLine Guide は Ishan Bangroo が開発した、境界を明確にした振り返り支援のプロトタイプです。',
    crisis_precheck: 'はっきり伝えてくれてありがとうございます。自分を傷つける計画を手伝うことはできません。今すぐ地域の緊急窓口や危機支援につながってください。',
    violence_precheck: '他者を傷つけることは手伝えません。関係する人や手段から離れて、今すぐ地域の緊急窓口や危機支援につながってください。',
    medical_boundary: '気持ちを整理する支えはできますが、症状の評価、診断、治療指示はできません。医療のことは資格のある臨床職または救急窓口に相談してください。',
    uncertainty_gate: 'ここでは慎重に進めたいです。短い一文で何が起きたかを教えて、そのあと今いちばんしんどい部分を教えてください。',
    model_error: '推測するより、ここではシンプルにします。短い一文で何が起きたかを教えて、そのあと今いちばんしんどい部分を教えてください。',
    local_support: '短い一文で何が起きたかを教えて、そのあと今いちばんしんどい部分を教えてください。'
  },
  ko: {
    social_checkin: '제가 여기 있습니다. 괜찮다면 오늘 가장 힘들었던 부분을 말해주세요.',
    opening_prompt: '최근에 힘들었던 순간 하나를 말해 주세요. 그리고 지금 가장 힘든 부분이 무엇인지 말해 주세요.',
    low_specificity_support: '오늘 어떤 한 장면이 힘들었던 건가요, 아니면 전반적으로 무거운 느낌인가요?',
    purpose_boundary: '힘든 부분은 함께 볼 수 있지만 그 일을 직접 대신할 수는 없습니다. 지금 가장 힘든 부분을 말해주세요.',
    tool_meta: 'KindLine Guide는 Ishan Bangroo가 만든 경계가 분명한 반성적 지원 프로토타입입니다.',
    crisis_precheck: '직접 말해줘서 고맙습니다. 스스로를 해치는 계획을 돕지는 못합니다. 지금 바로 지역 응급 서비스나 위기 지원 자원에 연락해 주세요.',
    violence_precheck: '다른 사람을 해치는 것을 도울 수는 없습니다. 관련된 사람이나 수단에서 떨어지고 지금 바로 지역 응급 서비스나 위기 지원 자원에 연락해 주세요.',
    medical_boundary: '감정을 정리하는 도움은 줄 수 있지만 증상 평가, 진단, 치료 지시는 할 수 없습니다. 의료 질문은 자격 있는 임상의나 응급 진료에 문의해 주세요.',
    uncertainty_gate: '여기서는 더 조심하고 싶습니다. 짧은 문장으로 무슨 일이 있었는지 말하고, 지금 가장 힘든 부분을 말해주세요.',
    model_error: '짐작하기보다 간단하게 가겠습니다. 짧은 문장으로 무슨 일이 있었는지 말하고, 지금 가장 힘든 부분을 말해주세요.',
    local_support: '짧은 문장으로 무슨 일이 있었는지 말하고, 지금 가장 힘든 부분을 말해주세요.'
  },
  tr: {
    social_checkin: 'Buradayım. İstersen bugün en zor gelen kısmı söyle.',
    opening_prompt: 'Son zamanlarda zor gelen bir anı anlat ve şimdi en ağır gelen kısmı söyle.',
    low_specificity_support: 'Bu bugün belirli bir an mıydı, yoksa genel olarak ağır bir his miydi?',
    purpose_boundary: 'Stresli kısımda seninle kalabilirim ama o işi doğrudan yapamam. Şu anda en zor gelen kısmı söyle.',
    tool_meta: 'KindLine Guide, Ishan Bangroo tarafından geliştirildi. Bu, sınırları belirli bir yansıtıcı destek prototipidir.',
    crisis_precheck: 'Bunu doğrudan söylemen önemli. Kendine zarar verme planına yardımcı olamam. Lütfen şimdi yerel acil hizmetlerle veya acil kriz desteğiyle iletişime geç.',
    violence_precheck: 'Bir başkasına zarar vermeye yardımcı olamam. Lütfen ilgili kişiden ya da araçtan uzaklaş ve şimdi yerel acil hizmetlerle veya acil kriz desteğiyle iletişime geç.',
    medical_boundary: 'Düşünmeni toparlamana yardımcı olabilirim, ancak semptom değerlendirmesi, tanı veya tedavi talimatı veremem. Tıbbi sorular için lisanslı bir klinisyenle ya da acil bakımla görüş.',
    uncertainty_gate: 'Burada dikkatli kalmak istiyorum. Kısa bir cümleyle ne olduğunu söyle, sonra şu anda en zor gelen kısmı belirt.',
    model_error: 'Tahmin etmek yerine bunu basit tutacağım. Kısa bir cümleyle ne olduğunu söyle, sonra şu anda en zor gelen kısmı belirt.',
    local_support: 'Kısa bir cümleyle ne olduğunu söyle, sonra şu anda en zor gelen kısmı belirt.'
  },
  it: {
    social_checkin: 'Sono qui con te. Se vuoi, dimmi quale parte di oggi è stata più difficile.',
    opening_prompt: 'Raccontami un momento recente che è stato difficile e poi dimmi quale parte pesa di più adesso.',
    low_specificity_support: 'È stato un momento specifico di oggi oppure una sensazione generale di pesantezza?',
    purpose_boundary: 'Posso restare con la parte stressante, ma non posso svolgere direttamente quel compito. Dimmi quale parte è più difficile adesso.',
    tool_meta: 'KindLine Guide è stato sviluppato da Ishan Bangroo. È un prototipo di supporto riflessivo con confini chiari.',
    crisis_precheck: 'Grazie per averlo detto così chiaramente. Non posso aiutare con un piano per farti del male. Ti prego di contattare subito i servizi di emergenza locali o una risorsa di crisi immediata.',
    violence_precheck: 'Non posso aiutare a fare del male a qualcun altro. Ti prego di allontanarti dalla persona o dai mezzi coinvolti e di contattare subito i servizi di emergenza locali o una risorsa di crisi immediata.',
    medical_boundary: 'Posso aiutarti a riflettere, ma non posso valutare sintomi, fare diagnosi o dare istruzioni di trattamento. Per domande mediche contatta un professionista abilitato o un servizio urgente.',
    uncertainty_gate: 'Voglio restare prudente qui. Dimmi in una frase breve cosa è successo e poi nomina la parte più difficile adesso.',
    model_error: 'Preferisco mantenerlo semplice invece di indovinare. Dimmi in una frase breve cosa è successo e poi nomina la parte più difficile adesso.',
    local_support: 'Dimmi in una frase breve cosa è successo e poi nomina la parte più difficile adesso.'
  },
  ta: {
    social_checkin: 'நான் இங்கே இருக்கிறேன். விரும்பினால் இன்று மிகக் கடினமாக இருந்த பகுதியை சொல்லுங்கள்.',
    opening_prompt: 'சமீபத்தில் கடினமாக இருந்த ஒரு தருணத்தை சொல்லுங்கள். இப்போது அதில் மிகக் கடினமாக இருப்பது எது என்பதையும் சொல்லுங்கள்.',
    low_specificity_support: 'இது இன்று நடந்த ஒரு குறிப்பிட்ட தருணமா, அல்லது மொத்தமாக கனமாக உள்ள உணர்வா?',
    purpose_boundary: 'அழுத்தமாக இருக்கும் பகுதியுடன் நான் இருக்க முடியும், ஆனால் அந்த வேலைையை நேரடியாக செய்ய முடியாது. இப்போது மிகவும் கடினமாக இருப்பது எது என்று சொல்லுங்கள்.',
    tool_meta: 'KindLine Guide-ஐ Ishan Bangroo உருவாக்கினார். இது எல்லை தெளிவாக உள்ள reflective-support prototype ஆகும்.',
    crisis_precheck: 'நீங்கள் இதை நேராக சொன்னது முக்கியம். உங்களையே காயப்படுத்தும் திட்டத்தில் நான் உதவ முடியாது. தயவுசெய்து உடனே உள்ளூர் அவசர சேவை அல்லது உடனடி crisis support-ஐ தொடர்பு கொள்ளுங்கள்.',
    violence_precheck: 'மற்றொருவரை காயப்படுத்த உதவ முடியாது. தயவுசெய்து அந்த நபர் அல்லது சாதனத்திலிருந்து விலகி உடனே உள்ளூர் அவசர சேவை அல்லது உடனடி crisis support-ஐ தொடர்பு கொள்ளுங்கள்.',
    medical_boundary: 'உங்கள் எண்ணங்களை திரட்ட உதவ முடியும், ஆனால் அறிகுறிகளை மதிப்பிடவும், diagnosis செய்யவும், treatment instructions கொடுக்கவும் முடியாது. மருத்துவ கேள்விகளுக்கு தகுதியான clinician அல்லது urgent care-ஐ தொடர்பு கொள்ளுங்கள்.',
    uncertainty_gate: 'இங்கே நான் கவனமாக இருக்க விரும்புகிறேன். ஒரு சிறிய வாக்கியத்தில் என்ன நடந்தது என்று சொல்லுங்கள், பின்னர் இப்போது மிகவும் கடினமாக இருப்பதை சொல்லுங்கள்.',
    model_error: 'ஊகிப்பதை விட எளிமையாக வைத்துக்கொள்கிறேன். ஒரு சிறிய வாக்கியத்தில் என்ன நடந்தது என்று சொல்லுங்கள், பின்னர் இப்போது மிகவும் கடினமாக இருப்பதை சொல்லுங்கள்.',
    local_support: 'ஒரு சிறிய வாக்கியத்தில் என்ன நடந்தது என்று சொல்லுங்கள், பின்னர் இப்போது மிகவும் கடினமாக இருப்பதை சொல்லுங்கள்.'
  },
  ur: {
    social_checkin: 'میں یہاں ہوں۔ اگر چاہیں تو بتائیں آج سب سے مشکل کیا لگ رہا ہے۔',
    opening_prompt: 'حالیہ کوئی ایک لمحہ بتائیں جو مشکل لگا، پھر بتائیں ابھی اس میں سب سے مشکل کیا محسوس ہو رہا ہے۔',
    low_specificity_support: 'یہ آج کا کوئی خاص لمحہ تھا یا مجموعی طور پر ایک بھاری احساس؟',
    purpose_boundary: 'میں دباؤ والے حصے کے ساتھ رہ سکتا ہوں، لیکن وہ کام براہِ راست نہیں کر سکتا۔ ابھی سب سے مشکل کیا لگ رہا ہے، وہ بتائیں۔',
    tool_meta: 'KindLine Guide کو Ishan Bangroo نے بنایا ہے۔ یہ ایک محدود reflective-support prototype ہے۔',
    crisis_precheck: 'آپ نے یہ بات صاف طور پر کہی، یہ اہم ہے۔ میں خود کو نقصان پہنچانے کے منصوبے میں مدد نہیں کر سکتا۔ براہِ کرم ابھی مقامی emergency services یا فوری crisis support سے رابطہ کریں۔',
    violence_precheck: 'میں کسی دوسرے کو نقصان پہنچانے میں مدد نہیں کر سکتا۔ براہِ کرم اس شخص یا ذریعے سے دور ہو جائیں اور ابھی مقامی emergency services یا فوری crisis support سے رابطہ کریں۔',
    medical_boundary: 'میں سوچ کو ترتیب دینے میں مدد کر سکتا ہوں، لیکن علامات کا جائزہ، diagnosis، یا treatment instructions نہیں دے سکتا۔ طبی سوالات کے لیے clinician یا urgent care سے رابطہ کریں۔',
    uncertainty_gate: 'میں یہاں احتیاط رکھنا چاہتا ہوں۔ ایک مختصر جملے میں بتائیں کیا ہوا، پھر بتائیں ابھی سب سے مشکل کیا لگ رہا ہے۔',
    model_error: 'اندازہ لگانے کے بجائے میں اسے سادہ رکھوں گا۔ ایک مختصر جملے میں بتائیں کیا ہوا، پھر بتائیں ابھی سب سے مشکل کیا لگ رہا ہے۔',
    local_support: 'ایک مختصر جملے میں بتائیں کیا ہوا، پھر بتائیں ابھی سب سے مشکل کیا لگ رہا ہے۔'
  }
};

function sanitizeContext(text = '') {
  return String(text || '').trim().slice(0, 280);
}

export function getLanguageOption(id = 'en') {
  return LANGUAGE_MAP.get(id) || LANGUAGE_MAP.get('en');
}

export function getToneOption(id = 'balanced') {
  return TONE_MAP.get(id) || TONE_MAP.get('balanced');
}

export function getMeaningStyleOption(id = 'auto') {
  return MEANING_STYLE_MAP.get(id) || MEANING_STYLE_MAP.get('auto');
}

export function detectLanguageHint(text = '') {
  const value = String(text || '').trim();
  if (!value) return null;

  for (const [id, pattern] of Object.entries(LANGUAGE_DETECTORS)) {
    if (pattern.test(value)) return id;
  }

  if (ROMAN_HINDI_PATTERNS.some((pattern) => pattern.test(value))) return 'hinglish';

  for (const item of SIMPLE_WORD_HINTS) {
    if (item.patterns.some((pattern) => pattern.test(value))) return item.id;
  }

  return null;
}

export function detectLanguageFromNote(text = '') {
  const value = String(text || '').trim();
  if (!value) return null;
  for (const item of LANGUAGE_HINTS) {
    if (item.patterns.some((pattern) => pattern.test(value))) return item.id;
  }
  return detectLanguageHint(value);
}

function resolveEffectiveLanguage(replyLanguage, userText, contextNote) {
  if (replyLanguage && replyLanguage !== 'auto' && replyLanguage !== 'match_message') {
    return replyLanguage;
  }

  if (replyLanguage === 'match_message') {
    return detectLanguageHint(userText) || detectLanguageFromNote(contextNote) || 'en';
  }

  return detectLanguageHint(userText) || detectLanguageFromNote(contextNote) || 'en';
}

function coerceHinglishForRomanHindi(languageId, userText, contextNote) {
  const hasRomanHindi = ROMAN_HINDI_PATTERNS.some((pattern) => pattern.test(String(userText || '')));
  const noteSuggestsHindi = /\bhindi\b/i.test(String(contextNote || ''));
  if ((languageId === 'hi' || languageId === 'hinglish') && hasRomanHindi) return 'hinglish';
  if (languageId === 'hi' && noteSuggestsHindi && /^[\x00-\x7F\s,.?!'-]*$/.test(String(userText || ''))) return 'hinglish';
  return languageId;
}

export function normalizePreferences(input = {}, userText = '') {
  const replyLanguage = typeof input?.replyLanguage === 'string' ? input.replyLanguage : 'auto';
  const replyTone = typeof input?.replyTone === 'string' ? input.replyTone : 'balanced';
  const meaningStyle = typeof input?.meaningStyle === 'string' ? input.meaningStyle : 'auto';
  const contextNote = sanitizeContext(input?.contextNote || input?.context || '');

  const sanitizedReplyLanguage = LANGUAGE_MAP.has(replyLanguage) ? replyLanguage : 'auto';
  const sanitizedReplyTone = TONE_MAP.has(replyTone) ? replyTone : 'balanced';
  const sanitizedMeaningStyle = MEANING_STYLE_MAP.has(meaningStyle) ? meaningStyle : 'auto';
  const carriedLanguage = typeof input?.effectiveLanguage === 'string' && LANGUAGE_MAP.has(input.effectiveLanguage)
    ? input.effectiveLanguage
    : null;
  let effectiveLanguage = carriedLanguage || resolveEffectiveLanguage(sanitizedReplyLanguage, userText, contextNote);
  effectiveLanguage = coerceHinglishForRomanHindi(effectiveLanguage, userText, contextNote);
  if (!LANGUAGE_MAP.has(effectiveLanguage)) effectiveLanguage = 'en';

  const languageOption = getLanguageOption(effectiveLanguage);
  const toneOption = getToneOption(sanitizedReplyTone);
  const meaningOption = getMeaningStyleOption(sanitizedMeaningStyle);

  return {
    replyLanguage: sanitizedReplyLanguage,
    replyTone: sanitizedReplyTone,
    meaningStyle: sanitizedMeaningStyle,
    contextNote,
    effectiveLanguage,
    effectiveLanguageLabel: languageOption.label,
    toneLabel: toneOption.label,
    meaningStyleLabel: meaningOption.label,
    locale: languageOption.locale,
    direction: ['ar', 'ur'].includes(effectiveLanguage) ? 'rtl' : 'ltr'
  };
}

function selectTemplate(languageId, key) {

  const langTemplates = TEMPLATES[languageId] || TEMPLATES.en;
  const value = langTemplates[key] ?? TEMPLATES.en[key];
  return value;
}

export function getLocalizedMessage(key, preferences = {}, vars = {}) {
  const effectiveLanguage = preferences?.effectiveLanguage || 'en';
  let template = selectTemplate(effectiveLanguage, key);
  if (template && typeof template === 'object') {
    template = template[preferences?.replyTone] || template.balanced || Object.values(template)[0];
  }
  if (typeof template !== 'string') {
    const fallback = selectTemplate('en', key);
    template = typeof fallback === 'object'
      ? fallback[preferences?.replyTone] || fallback.balanced || Object.values(fallback)[0]
      : fallback;
  }
  return String(template || '').replace(/\{(\w+)\}/g, (_, name) => String(vars?.[name] ?? ''));
}

export function buildSupportContractPrompt(preferences = {}) {
  const option = getLanguageOption(preferences.effectiveLanguage || 'en');
  const tone = getToneOption(preferences.replyTone || 'balanced');
  const meaning = getMeaningStyleOption(preferences.meaningStyle || 'auto');
  const lines = [
    `Support contract:`,
    `- reply language: ${option.promptLabel}`,
    `- reply tone: ${tone.label}`,
    `- meaning style: ${meaning.label}`
  ];
  if (preferences.contextNote) {
    lines.push(`- user-provided context note: ${preferences.contextNote}`);
    lines.push('Use the context note only to adjust wording, examples, or sensitivity. Do not infer identity, diagnosis, culture, religion, or family structure beyond what the user explicitly wrote.');
  } else {
    lines.push('- no extra context note was provided');
    lines.push('Do not infer culture, diagnosis, identity, religion, or family structure beyond the user’s words.');
  }

  if (preferences.effectiveLanguage === 'hinglish') {
    lines.push('- write in simple Roman-script Hinglish, not Devanagari');
  }

  if (preferences.replyLanguage === 'match_message') {
    lines.push('- match the user message language when natural and safe');
  }

  if (preferences.meaningStyle === 'literal') {
    lines.push(`- prefer a literal reading of the user's words unless the user clearly asks for interpretation`);
  } else if (preferences.meaningStyle === 'colloquial') {
    lines.push('- treat slang or colloquial wording as possibly idiomatic; clarify before over-literal interpretation');
  } else if (preferences.meaningStyle === 'indirect') {
    lines.push('- assume the user may be speaking indirectly or understating their distress; ask one short clarification before a strong interpretation');
  } else if (preferences.meaningStyle === 'cultural_context') {
    lines.push('- assume wording may carry culture-specific or community-specific meaning; use the context note if present and ask one short clarification rather than stereotyping or overgeneralizing');
  }

  if (preferences.replyTone === 'gentler') {
    lines.push('- keep the tone warm and steady, without sounding sugary');
  } else if (preferences.replyTone === 'direct') {
    lines.push('- keep the tone calm and direct, with minimal softening');
  } else {
    lines.push('- keep the tone calm, clear, and balanced');
  }

  return lines.join('\n');
}

export function languageInstructionForHumans(preferences = {}) {
  const option = getLanguageOption(preferences.effectiveLanguage || 'en');
  const tone = getToneOption(preferences.replyTone || 'balanced');
  const meaning = getMeaningStyleOption(preferences.meaningStyle || 'auto');
  return `${option.label} • ${tone.label} • ${meaning.label}`;
}

export function listLanguageOptions() {
  return LANGUAGE_OPTIONS;
}

export function listToneOptions() {
  return TONE_OPTIONS;
}

export function listMeaningStyleOptions() {
  return MEANING_STYLE_OPTIONS;
}
