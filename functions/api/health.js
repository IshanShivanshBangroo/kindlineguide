export async function onRequestGet(context) {
  return Response.json({
    ok: true,
    app: context.env.APP_NAME || 'KindLine Guide',
    model: context.env.MODEL_NAME || '@cf/meta/llama-3.1-8b-instruct-fast',
    timestamp: new Date().toISOString()
  });
}
