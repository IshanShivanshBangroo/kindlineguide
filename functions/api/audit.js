import { runArtifactAudit } from '../../lib/audit.js';

export async function onRequestPost(context) {
  const results = await runArtifactAudit({ env: context.env });
  return Response.json({ ok: true, ...results });
}

export async function onRequestGet(context) {
  return onRequestPost(context);
}
