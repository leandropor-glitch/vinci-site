# Mercado Pago Worker

O Worker expõe `/api/checkout/pro`, `/api/subscription`, `/api/payment`, `/api/config` e `/api/webhook`. Preços são mantidos em `src/worker.mjs`. O valor recebido do navegador é ignorado.

## Configuração e publicação de teste

Configure a chave pública de teste como variável `MP_PUBLIC_KEY` no painel Cloudflare Workers (Settings → Variables and Secrets). Configure os segredos somente pelo CLI, sem colá-los em arquivos ou argumentos:

```sh
cd ~/FelyxApp/pagamento-mp/pagamento-mp-worker
wrangler secret put MP_ACCESS_TOKEN
wrangler secret put MP_WEBHOOK_SECRET
wrangler deploy
```

O Wrangler solicitará os valores interativamente. Use apenas credenciais de teste e uma conta Wrangler já autenticada. O URL da notificação é derivado do URL atual do Worker. Após o deploy de teste, configure esse URL no painel Mercado Pago como URL de webhook para eventos de pagamento.

As páginas estáticas usam caminhos absolutos do domínio principal e chamam `/api/...`; para teste integrado, o Worker precisa estar roteado para `/api/*` em `www.vinciautomacao.com`, ou o front-end deve ser apontado para o endereço de teste do Worker antes de testar fora do domínio. Não publique essa configuração na `main` sem autorização.

## Testes locais

```sh
node --test test/worker.test.mjs
node --check src/worker.mjs
```

Os testes automatizados cobrem assinatura válida, assinatura alterada, timestamp expirado e cálculo de preço independente do valor do cliente. Aprovações/recusas reais de sandbox e recebimento de webhook exigem credenciais de teste, configuração da aplicação e URL pública de webhook.
