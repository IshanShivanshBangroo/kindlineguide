# Design rationale

This revision is built around one correction: the artifact should have one stable participant-facing identity.

The earlier prototype was too willing to do three jobs at once. It looked partly like a support tool, partly like a debugging dashboard, and partly like a general-purpose chatbot. That created four problems.

1. The support-mode menu risked reading like self-categorization.
2. The threshold slider made the participant manage an internal gate setting.
3. The diagnostics panel leaked model-facing instrumentation into the participant experience.
4. The system could still answer unrelated tasks instead of staying with reflective support.

## What the split interface fixes

The participant view does one job: it offers bounded reflective support in plain language.

The research console does a different job: it exposes threshold tuning, diagnostics, artifact audit, scripted evaluation, and purpose-route inspection.

## Why the participant view now defaults to Start broad

The participant should not need to decide which bucket they belong to before writing a first message. The default mode is broad on purpose, and the support-style picker is collapsed until the user chooses to change it.

## Why the repository now includes a purpose-fit router

The artifact is meant for reflective support, not for general task completion. The purpose-fit router handles two cases before generation:

- very brief openings, which are routed to a scoped opening prompt,
- unrelated task or knowledge requests, which are redirected back to reflective support.

This keeps the artifact from behaving like a general chatbot with a safety layer attached after the fact.

## Why context is user-provided instead of inferred

If language, family, community, faith, work, school, or cultural context matters, the user can state it in their own words. The prompt explicitly tells the model not to infer or stereotype culture or identity when that note is absent.

## Why browser voice is optional

Voice helps the artifact feel more natural in use, but it should not dominate the design. The participant view therefore supports browser speech input and spoken replies as optional features while keeping typed input as the stable default.

## Why the gate score stays researcher-facing

The gate score is a heuristic combination of uncertainty, model self-risk, and rule risk. It is useful for inspection and tuning. It is not useful as a participant-facing control.

## Why the repository includes an artifact audit

A first-stage paper can make a concrete HCI contribution without making claims about therapeutic benefit before those are actually studied. The deterministic artifact audit exists to support that first stage.
