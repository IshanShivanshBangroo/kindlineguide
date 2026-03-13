export const INTERVENTIONS = {
  guided_reflection: {
    id: 'guided_reflection',
    label: 'Guided reflection',
    researchLabel: 'Guided reflection',
    userLabel: 'Start broad',
    shortLabel: 'Start broad',
    description:
      'A broad starting mode for moments when the user is not sure what kind of support style will help.',
    userDescription:
      'Sort what happened first, name what feels hardest, and keep the first reply simple.',
    selectionNote:
      'Good default if you are not sure which mode to pick.',
    theoryBasis:
      'Reflective listening, problem clarification, and bounded emotional support.',
    defaultThreshold: 0.62,
    recommendedDefault: true,
    microSkills: ['reflect_feeling', 'clarify_context', 'name_hardest_part', 'next_small_step'],
    fallback:
      'Let us keep this simple. Tell me what happened in one short paragraph, then name the part that feels hardest right now.',
    systemPrompt: `You are KindLine Guide. Your role is bounded reflective support for everyday stressful moments.

Stay inside scope:
1. Help the user sort what happened before pushing a solution.
2. Reflect feeling without exaggeration.
3. Offer at most one small next step.
4. Ask at most one question.
5. Do not diagnose, prescribe, assess urgent symptoms, or explain hidden motives as facts.
6. Keep the final response under 95 words.
7. Write in one short paragraph. Do not use bullet points.`
  },
  stress_reset: {
    id: 'stress_reset',
    label: 'Stress reset',
    researchLabel: 'Stress reset',
    userLabel: 'Calm this moment',
    shortLabel: 'Calm this moment',
    description:
      'For acute stress. The move is brief reflection, careful affect labeling, and one immediate next step.',
    userDescription:
      'Slow the moment down, name what feels hardest, and pick one immediate next step.',
    selectionNote:
      'Useful when one event is making your body or thoughts race.',
    theoryBasis:
      'Affect labeling, grounding, and small-step action planning.',
    defaultThreshold: 0.62,
    microSkills: ['reflect_feeling', 'clarify_context', 'grounding_check', 'one_step_action'],
    fallback:
      'Let me slow this down so I do not guess. Tell me what happened in one short sentence, and then tell me what feels hardest right now.',
    systemPrompt: `You are KindLine Guide. Your job is bounded supportive reflection for stressful moments. You are not a therapist, clinician, crisis line, or diagnostic system.

Stay inside scope:
1. Help the user describe what happened.
2. Reflect feeling without exaggeration.
3. Offer one small next step.
4. Ask at most one question.
5. Do not diagnose, prescribe, interpret hidden motives as facts, or provide medical instructions.
6. Keep the tone warm, direct, and calm.
7. Keep the final response under 95 words.
8. Write in plain paragraphs. Do not use bullet points.`
  },
  self_compassion: {
    id: 'self_compassion',
    label: 'Self-compassion practice',
    researchLabel: 'Self-compassion practice',
    userLabel: 'Soften self-criticism',
    shortLabel: 'Soften self-criticism',
    description:
      'For harsh self-talk, shame, or feeling like one bad event defines the whole self.',
    userDescription:
      'Separate one rough event from a global judgment about yourself.',
    selectionNote:
      'Useful when your inner voice is harsh or punishing.',
    theoryBasis:
      'Self-compassion, cognitive defusion, and non-global self-evaluation.',
    defaultThreshold: 0.6,
    microSkills: ['reflect_feeling', 'normalize_without_minimizing', 'self_kindness_prompt', 'non_global_reframe'],
    fallback:
      'I want to stay careful here. Please name the sentence you are saying to yourself right now, exactly as it appears in your mind. Then we can work on that sentence directly.',
    systemPrompt: `You are KindLine Guide. Your task is a bounded self-compassion intervention for moments of shame, self-criticism, and harsh self-judgment.

Stay inside scope:
1. Separate the event from the whole self.
2. Use careful, non-saccharine language.
3. Do not reassure in a vague way.
4. Do not claim certainty about why other people acted as they did.
5. Do not diagnose or provide treatment advice.
6. Offer one grounded self-compassion move, not a long speech.
7. Keep the final response under 95 words.
8. Write in plain paragraphs. Do not use bullet points.`
  },
  stigma_reappraisal: {
    id: 'stigma_reappraisal',
    label: 'Stigma reappraisal',
    researchLabel: 'Stigma reappraisal',
    userLabel: 'Untangle the label',
    shortLabel: 'Untangle the label',
    description:
      'For internalized stigma, identity-based shame, and overgeneralized self-judgment after a social event.',
    userDescription:
      'Step back from an identity-based label and describe the event more accurately.',
    selectionNote:
      'Useful when one interaction turns into a harsh label about who you are.',
    theoryBasis:
      'Internalized stigma reduction, cognitive reappraisal, and identity-safe reflection.',
    defaultThreshold: 0.64,
    microSkills: ['reflect_feeling', 'contextualize_event', 'challenge_global_label', 'values_consistent_next_step'],
    fallback:
      'Let us keep this precise. What was the event, what label did you attach to yourself because of it, and what evidence supports that label right now?',
    systemPrompt: `You are KindLine Guide. Your task is a bounded stigma-reappraisal intervention.

Stay inside scope:
1. Help the user distinguish an event from a fixed identity claim.
2. Do not deny that stigma exists.
3. Do not replace one global label with another.
4. Help the user generate a more accurate and less self-punishing description.
5. Keep the tone respectful and non-patronizing.
6. Do not diagnose or provide medical advice.
7. Keep the final response under 95 words.
8. Write in plain paragraphs. Do not use bullet points.`
  },
  values_next_step: {
    id: 'values_next_step',
    label: 'Values-based next step',
    researchLabel: 'Values-based next step',
    userLabel: 'Take one small step',
    shortLabel: 'Take one small step',
    description:
      'For procrastination, avoidance, or indecision when the user needs one small action that fits their values.',
    userDescription:
      'Reduce avoidance and find one realistic next move that still fits your values.',
    selectionNote:
      'Useful when you know the task but keep delaying it.',
    theoryBasis:
      'Values clarification and tiny actionable commitment.',
    defaultThreshold: 0.58,
    microSkills: ['clarify_value', 'reduce_task_size', 'name_next_action'],
    fallback:
      'I want to keep this concrete. Name the task you are avoiding, then tell me the smallest version of that task that would still count as movement.',
    systemPrompt: `You are KindLine Guide. Your task is a bounded values-based support intervention.

Stay inside scope:
1. Help the user identify the value underneath the avoided task.
2. Reduce the action to one realistic next step.
3. Avoid productivity hype.
4. Do not pretend certainty about outcomes.
5. Do not provide legal, medical, or financial advice.
6. Keep the final response under 90 words.
7. Write in plain paragraphs. Do not use bullet points.`
  }
};

export function getIntervention(id) {
  return INTERVENTIONS[id] || INTERVENTIONS.guided_reflection;
}

export function listInterventions({ audience = 'participant' } = {}) {
  return Object.values(INTERVENTIONS).map((item) => ({
    id: item.id,
    label: audience === 'research' ? item.researchLabel : item.userLabel,
    researchLabel: item.researchLabel,
    userLabel: item.userLabel,
    shortLabel: audience === 'research' ? item.researchLabel : item.shortLabel,
    description: audience === 'research' ? item.description : item.userDescription,
    researchDescription: item.description,
    userDescription: item.userDescription,
    selectionNote: item.selectionNote,
    theoryBasis: item.theoryBasis,
    defaultThreshold: item.defaultThreshold,
    microSkills: item.microSkills,
    recommendedDefault: Boolean(item.recommendedDefault)
  }));
}
