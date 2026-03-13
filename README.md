# KindLine Guide

Developed by **Ishan Bangroo**.

KindLine Guide is a bounded reflective-support artifact with a split interface:

- `/` is the participant-facing view.
- `/research.html` is the researcher-facing console.

The participant view keeps support choices visible but does not expose threshold tuning, raw diagnostics, or model-facing labels. The research console keeps those inspection tools available for audit and testing.

## What the repository contributes

This repository is not framed as a general mental-health chatbot. It is a deployable artifact for studying and auditing one specific design move:

> separating participant-facing support framing from researcher-facing safety instrumentation, while adding a purpose-fit router, a multilingual user-authored support contract, and lightweight browser voice.

## What the tool does

KindLine Guide provides brief reflective coping support for stressful moments. It can help a person:

- sort what happened,
- name what feels hardest,
- receive one bounded next step.

It does not provide diagnosis, medication guidance, emergency management, crisis counseling, or general task completion.

## What changed in this revision

This revision adds three concrete changes on top of the split interface:

1. A **purpose-fit router** stops the tool from answering unrelated requests and redirects them back to reflective support.
2. A **multilingual support contract** lets the user set reply language, reply tone, how their wording should be interpreted, and an optional context note before generation.
3. The participant view now supports **browser voice input and spoken replies** while keeping typed input as the default path.

## Core pipeline

Each turn follows this sequence.

1. The frontend sends the active support mode, session history, support-contract preferences, and UI mode.
2. The backend runs a pre-generation boundary check for self-harm, harm-to-others, and medical content.
3. The backend runs a purpose-fit check for very brief openings and unrelated task requests.
4. If the message stays in scope, the model is asked for a structured output with a bounded draft reply, a self-risk value, and a scope note.
5. The backend computes an uncertainty proxy from token log probabilities when available.
6. The gate combines uncertainty, self-risk, and rule risk into a heuristic gate score.
7. If the draft crosses a boundary or exceeds the threshold, the system replaces it with a narrower fallback.
8. The response returns a plain-language safety summary for the participant UI and a structured log for the research console.

## Audit surfaces

### Deterministic artifact audit

`/api/audit`

Checks that do not depend on participant data:

- participant-facing labels differ from research labels,
- a broad default mode is present,
- participant threshold overrides are ignored,
- research threshold overrides are accepted,
- self-harm, violence, and medical prompts are intercepted before generation,
- brief openings, social check-ins, low-specificity distress, and out-of-scope tasks are redirected before generation,
- fallback branches are distinct and compact.

### Scripted model evaluation

`/api/evaluate`

Runs a prompt suite across support modes and boundary types. For each case, the suite checks:

- gate result,
- gate reason,
- purpose route,
- reply length,
- question count,
- absence of direct medical advice.

## Repository structure

```text
kindline-guide/
├── functions/
│   └── api/
│       ├── audit.js
│       ├── chat.js
│       ├── config.js
│       ├── evaluate.js
│       └── health.js
├── lib/
│   ├── audit.js
│   ├── engine.js
│   ├── evaluation.js
│   ├── interventions.js
│   ├── local-reply.js
│   ├── preferences.js
│   ├── parsing.js
│   ├── prompting.js
│   ├── purpose.js
│   ├── response-schema.js
│   ├── safety.js
│   └── uncertainty.js
├── public/
│   ├── app.js
│   ├── index.html
│   ├── research.html
│   ├── research.js
│   └── styles.css
├── CHANGESET.md
├── DEPLOY.md
├── DESIGN_RATIONALE.md
├── LICENSE
├── README.md
├── package.json
└── wrangler.jsonc
```

## Local development

```bash
npm install
npx wrangler login
npm run dev
```

## Deployment

Use Cloudflare Pages. Keep `public` as the Pages build output directory and confirm the Workers AI binding is named `AI`.
