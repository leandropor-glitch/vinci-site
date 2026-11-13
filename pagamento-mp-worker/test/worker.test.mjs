import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { priceFor, verifySignature } from '../src/worker.mjs';
import { createHmac } from 'node:crypto';

const now = 1_800_000_000_000;
function sign(secret, id, requestId, ts) {
  const manifest = `id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`;
  return `ts=${ts},v1=${createHmac('sha256', secret).update(manifest).digest('hex')}`;
}

test('assinatura válida passa', async () => {
  const signature = sign('webhook-test-secret', 'PAY-123', 'req-abc', Math.floor(now / 1000));
  assert.equal(await verifySignature({ signature, requestId: 'req-abc', dataId: 'PAY-123', secret: 'webhook-test-secret', now }), true);
});
test('assinatura alterada falha', async () => {
  const signature = sign('webhook-test-secret', 'PAY-123', 'req-abc', Math.floor(now / 1000)).replace(/.$/, '0');
  assert.equal(await verifySignature({ signature, requestId: 'req-abc', dataId: 'PAY-123', secret: 'webhook-test-secret', now }), false);
});
test('timestamp com mais de cinco minutos falha', async () => {
  const stale = Math.floor(now / 1000) - 301;
  assert.equal(await verifySignature({ signature: sign('webhook-test-secret', 'PAY-123', 'req-abc', stale), requestId: 'req-abc', dataId: 'PAY-123', secret: 'webhook-test-secret', now }), false);
});
test('preço é obtido da tabela e ignora valor enviado pelo cliente', () => {
  assert.equal(priceFor('leda-pro-monthly', 0.01), 126.90);
  assert.equal(priceFor('felyx-full-monthly', 999999), 199.90);
  assert.throws(() => priceFor('plano-inexistente', 15), /Plano inválido/);
});

test('webhook assinado sem Origin recebe 200 e consulta preapproval em background', async () => {
  const requestId = 'req-sub';
  const ts = Math.floor(Date.now() / 1000);
  let requestedPath;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => { requestedPath = new URL(url).pathname; return new Response('{}'); };
  const background = [];
  try {
    const request = new Request(`https://worker.example/api/webhook?type=subscription_preapproval&data.id=SUB-1`, {
      method: 'POST', headers: { 'x-request-id': requestId, 'x-signature': sign('secret', 'SUB-1', requestId, ts) }, body: '{}'
    });
    const response = await worker.fetch(request, { MP_WEBHOOK_SECRET: 'secret', MP_ACCESS_TOKEN: 'token' }, { waitUntil: promise => background.push(promise) });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { received: true });
    await Promise.all(background);
    assert.equal(requestedPath, '/preapproval/SUB-1');
  } finally { globalThis.fetch = originalFetch; }
});

test('webhook sem assinatura válida recebe 401', async () => {
  const response = await worker.fetch(new Request('https://worker.example/api/webhook?id=PAY-1', {
    method: 'POST', headers: { 'x-request-id': 'req-bad', 'x-signature': 'ts=1,v1=bad' }, body: '{}'
  }), { MP_WEBHOOK_SECRET: 'secret' });
  assert.equal(response.status, 401);
});

test('rota do navegador com Origin estranha recebe 403', async () => {
  const response = await worker.fetch(new Request('https://worker.example/api/config', {
    headers: { origin: 'https://attacker.example' }
  }), {});
  assert.equal(response.status, 403);
});
