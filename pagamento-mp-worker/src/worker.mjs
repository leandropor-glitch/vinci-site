const PLANS = Object.freeze({
  'leda-starter-monthly': { title: 'Leda Starter mensal', amount: 58.90, frequency: 1, unit: 'months' },
  'leda-pro-monthly': { title: 'Leda Pro mensal', amount: 126.90, frequency: 1, unit: 'months' },
  'leda-god-monthly': { title: 'Leda God mensal', amount: 252.90, frequency: 1, unit: 'months' },
  'leda-starter-yearly': { title: 'Leda Starter anual', amount: 589, frequency: 12, unit: 'months' },
  'leda-pro-yearly': { title: 'Leda Pro anual', amount: 1269, frequency: 12, unit: 'months' },
  'leda-god-yearly': { title: 'Leda God anual', amount: 2529, frequency: 12, unit: 'months' },
  'felyx-gem-monthly': { title: 'Felyx GEM mensal (EXEMPLO)', amount: 49.90, frequency: 1, unit: 'months' },
  'felyx-full-monthly': { title: 'Felyx FULL mensal (EXEMPLO)', amount: 199.90, frequency: 1, unit: 'months' }
});

export function priceFor(planId, _clientAmount) {
  const plan = PLANS[planId];
  if (!plan) throw new Error('Plano inválido');
  return plan.amount;
}

export async function verifySignature({ signature, requestId, dataId, secret, now = Date.now() }) {
  if (!signature || !requestId || !dataId || !secret) return false;
  const parts = Object.fromEntries(signature.split(',').map(part => {
    const i = part.indexOf('='); return i < 0 ? ['', ''] : [part.slice(0, i).trim(), part.slice(i + 1).trim()];
  }));
  const ts = Number(parts.ts);
  if (!Number.isFinite(ts) || Math.abs(Math.floor(now / 1000) - ts) > 300 || !/^[a-f\d]{64}$/i.test(parts.v1 || '')) return false;
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest)));
  const expected = [...mac].map(x => x.toString(16).padStart(2, '0')).join('');
  let diff = expected.length ^ parts.v1.length;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ (parts.v1.charCodeAt(i) || 0);
  return diff === 0;
}

const API = 'https://api.mercadopago.com';
const allowed = origin => origin === 'https://www.vinciautomacao.com' || /^http:\/\/localhost(?::\d+)?$/.test(origin || '');
function json(data, status = 200, origin = '') {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type,x-request-id' };
  if (allowed(origin)) { headers['access-control-allow-origin'] = origin; headers.vary = 'Origin'; }
  return new Response(JSON.stringify(data), { status, headers });
}
function corsError(origin) { return !allowed(origin); }
async function mpFetch(path, env, body, idempotencyKey) {
  const headers = { authorization: `Bearer ${env.MP_ACCESS_TOKEN}`, 'content-type': 'application/json' };
  if (idempotencyKey) headers['x-idempotency-key'] = idempotencyKey;
  const res = await fetch(`${API}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Mercado Pago respondeu HTTP ${res.status}`);
  return data;
}
function reference() { return `vinci-${crypto.randomUUID()}`; }

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('origin') || '';
    const url = new URL(request.url);
    if (url.pathname === '/api/webhook' && request.method === 'POST') return webhook(request, env, ctx);
    if (corsError(origin)) return json({ error: 'Origem não permitida' }, 403, '');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type,x-request-id', vary: 'Origin' } });
    if (url.pathname === '/api/config' && request.method === 'GET') return json({ publicKey: env.MP_PUBLIC_KEY || '', prices: Object.fromEntries(Object.entries(PLANS).map(([id, plan]) => [id, plan.amount])) }, 200, origin);
    if (!env.MP_ACCESS_TOKEN) return json({ error: 'Credencial de teste MP_ACCESS_TOKEN não configurada no Worker' }, 503, origin);
    try {
      const input = await request.json();
      if (url.pathname === '/api/checkout/pro' && request.method === 'POST') {
        const plan = PLANS[input.plan_id]; if (!plan || !/^\S+@\S+\.\S+$/.test(input.email || '')) return json({ error: 'Plano ou e-mail inválido' }, 400, origin);
        const ref = reference();
        const pref = await mpFetch('/checkout/preferences', env, {
          items: [{ id: input.plan_id, title: plan.title, quantity: 1, currency_id: 'BRL', unit_price: priceFor(input.plan_id, input.amount) }],
          payer: { email: input.email }, external_reference: ref,
          back_urls: { success: 'https://www.vinciautomacao.com/pagamento-teste/obrigado/', failure: 'https://www.vinciautomacao.com/pagamento-teste/obrigado/', pending: 'https://www.vinciautomacao.com/pagamento-teste/obrigado/' },
          auto_return: 'approved', notification_url: new URL('/api/webhook', request.url).toString()
        }, ref);
        return json({ init_point: pref.init_point }, 200, origin);
      }
      if (url.pathname === '/api/subscription' && request.method === 'POST') {
        const plan = PLANS[input.plan_id]; if (!plan || !input.email) return json({ error: 'Plano ou e-mail inválido' }, 400, origin);
        const ref = reference();
        const sub = await mpFetch('/preapproval', env, { reason: plan.title, payer_email: input.email, external_reference: ref, back_url: 'https://www.vinciautomacao.com/pagamento-teste/obrigado/', auto_recurring: { frequency: plan.frequency, frequency_type: plan.unit, transaction_amount: priceFor(input.plan_id, input.amount), currency_id: 'BRL' }, status: 'pending' }, ref);
        return json({ init_point: sub.init_point }, 200, origin);
      }
      if (url.pathname === '/api/payment' && request.method === 'POST') {
        const plan = PLANS[input.plan_id]; if (!plan || !input.token || !input.payment_method_id || !input.payer?.email) return json({ error: 'Dados de pagamento incompletos' }, 400, origin);
        const ref = reference();
        const payment = await mpFetch('/v1/payments', env, { transaction_amount: priceFor(input.plan_id, input.amount), token: input.token, description: plan.title, installments: Number(input.installments) || 1, payment_method_id: input.payment_method_id, issuer_id: input.issuer_id, payer: { email: input.payer.email, identification: input.payer.identification }, external_reference: ref, notification_url: new URL('/api/webhook', request.url).toString() }, ref);
        return json({ status: payment.status, id: payment.id }, 200, origin);
      }
      return json({ error: 'Rota não encontrada' }, 404, origin);
    } catch (error) { return json({ error: error.message || 'Falha ao processar solicitação' }, 502, origin); }
  }
};

async function webhook(request, env, ctx) {
  const url = new URL(request.url);
  let body = {};
  try { body = await request.clone().json(); } catch {}
  const dataId = url.searchParams.get('data.id') || url.searchParams.get('id') || body.data?.id || body.id;
  const valid = await verifySignature({ signature: request.headers.get('x-signature'), requestId: request.headers.get('x-request-id'), dataId, secret: env.MP_WEBHOOK_SECRET });
  if (!valid) return json({ error: 'Assinatura inválida ou expirada' }, 401);
  if (env.MP_ACCESS_TOKEN) {
    const topic = String(url.searchParams.get('type') || url.searchParams.get('topic') || body.type || body.topic || '').toLowerCase();
    let path = `/v1/payments/${encodeURIComponent(dataId)}`;
    if (topic === 'subscription_preapproval' || topic === 'preapproval') path = `/preapproval/${encodeURIComponent(dataId)}`;
    else if (topic === 'subscription_authorized_payment' || topic === 'authorized_payment') path = `/authorized_payments/${encodeURIComponent(dataId)}`;
    const lookup = fetch(`${API}${path}`, { headers: { authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } }).catch(() => {});
    if (ctx?.waitUntil) ctx.waitUntil(lookup);
  }
  return json({ received: true });
}
