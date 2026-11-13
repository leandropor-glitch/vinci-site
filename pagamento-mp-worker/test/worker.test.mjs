import test from 'node:test';
import assert from 'node:assert/strict';
import { priceFor, verifySignature } from '../src/worker.mjs';
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
