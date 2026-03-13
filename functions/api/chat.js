import { runSupportTurn } from '../../lib/engine.js';

function badRequest(message) {
  return Response.json({ ok: false, error: message }, { status: 400 });
}

function internalError(error) {
  return Response.json(
    {
      ok: false,
      error: 'The reply could not be generated on the server.',
      detail: String(error?.message || error || '')
    },
    { status: 500 }
  );
}

function sanitizePreferences(input = {}) {
  return {
    replyLanguage: typeof input?.replyLanguage === 'string' ? input.replyLanguage : 'auto',
    replyTone: typeof input?.replyTone === 'string' ? input.replyTone : 'balanced',
    meaningStyle: typeof input?.meaningStyle === 'string' ? input.meaningStyle : 'auto',
    contextNote: typeof input?.contextNote === 'string' ? input.contextNote.slice(0, 280) : ''
  };
}

export async function onRequestPost(context) {
  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const sessionId = typeof payload?.sessionId === 'string' && payload.sessionId.trim()
    ? payload.sessionId.trim()
    : crypto.randomUUID();
  const interventionId = typeof payload?.interventionId === 'string' ? payload.interventionId : 'guided_reflection';
  const uiMode = payload?.uiMode === 'research' ? 'research' : 'participant';
  const threshold = uiMode === 'research' ? payload?.threshold : undefined;
  const history = Array.isArray(payload?.messages) ? payload.messages : [];
  const preferences = sanitizePreferences({
    ...(payload?.preferences || {}),
    contextNote: typeof payload?.contextNote === 'string'
      ? payload.contextNote
      : payload?.preferences?.contextNote
  });

  if (!history.length) {
    return badRequest('messages must include at least one user message.');
  }

  const lastUser = [...history].reverse().find((item) => item?.role === 'user' && typeof item?.content === 'string');
  if (!lastUser) {
    return badRequest('messages must include a user role item with content.');
  }

  if (String(lastUser.content).length > 2500) {
    return badRequest('The latest user message is too long. Keep it under 2500 characters.');
  }

  try {
    const result = await runSupportTurn({
      env: context.env,
      sessionId,
      interventionId,
      threshold,
      history,
      uiMode,
      preferences
    });

    return Response.json(result);
  } catch (error) {
    return internalError(error);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS'
    }
  });
}
