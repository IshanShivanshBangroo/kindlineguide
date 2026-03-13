import { listInterventions } from '../../lib/interventions.js';
import { listLanguageOptions, listToneOptions, listMeaningStyleOptions } from '../../lib/preferences.js';

export async function onRequestGet(context) {
  const model = context.env.MODEL_NAME || '@cf/meta/llama-3.1-8b-instruct-fast';
  return Response.json({
    app: {
      name: context.env.APP_NAME || 'KindLine Guide',
      developer: 'Ishan Bangroo',
      participantSubtitle:
        'A bounded tool for brief reflective coping support. It is not diagnosis, therapy, crisis support, or medical care. The support contract lets people guide reply language, tone, and meaning without self-diagnosis.',
      researchSubtitle:
        'A separate inspection console for support-contract testing, gate tuning, deterministic artifact audit, scripted evaluation, and support-mode analysis.',
      researchConsolePath: '/research.html'
    },
    defaults: {
      model,
      participantIntervention: 'guided_reflection',
      researchIntervention: 'guided_reflection',
      researchThreshold: Number(context.env.DEFAULT_THRESHOLD || 0.62),
      replyLanguage: 'auto',
      replyTone: 'balanced',
      meaningStyle: 'auto'
    },
    ui: {
      participant: {
        adjustableThreshold: false,
        diagnostics: false,
        localExportOnly: true,
        stylePickerCollapsedByDefault: true,
        browserSpeechOutput: true,
        browserSpeechInput: true
      },
      research: {
        adjustableThreshold: true,
        diagnostics: true,
        evaluation: true,
        artifactAudit: true
      }
    },
    voice: {
      synthesisDefault: false,
      recognitionHint: 'best_effort_browser_support',
      secureContextRequired: true
    },
    supportContract: {
      languageOptions: listLanguageOptions(),
      toneOptions: listToneOptions(),
      meaningStyleOptions: listMeaningStyleOptions(),
      contextPlaceholder: 'Optional: language, family, community, faith, work, school, or cultural context that affects how your wording should be read.',
      note: 'These preferences guide reply language, tone, and interpretation. They are not labels about you and they are not a diagnosis.'
    },
    supportModes: listInterventions({ audience: 'participant' }),
    researchModes: listInterventions({ audience: 'research' })
  });
}
