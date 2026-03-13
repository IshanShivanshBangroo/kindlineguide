# Testing summary

This repository was checked with three layers of local verification before packaging:

1. **Syntax checks** for all modified JavaScript files using `node --check`.
2. **Built-in verification** using `node verify.mjs`, which runs the deterministic artifact audit and the scripted evaluation suite against a mocked Workers AI environment.
3. **Extended regression scenarios** covering:
   - Hinglish check-ins (`kaise ho`)
   - Arabic greetings (`مرحبا`)
   - Portuguese greetings (`oi`)
   - low-specificity distress (`i am low`)
   - indirect wording (`fine i guess`)
   - culture-shaped wording (`my existence is okish`)
   - identity drift replacement
   - generic-draft replacement
   - rescue from plain-string and JSON-string model responses

The goal of the test set is not to prove therapeutic benefit. It is to confirm that the artifact stays within its declared scope and that the support contract actually changes routing and reply behavior.
