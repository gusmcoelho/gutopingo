## Visão geral

O bot Discord vai ter um painel novo (`/setup-shop`) com botões pros 4 planos. Quando o user clica, escolhe método (PIX / Cartão / PayPal) e o bot chama uma API pública do site, que cria o pagamento e devolve um link/QR. Quando o pagamento confirma (via webhook que já existe), o bot **automaticamente** cria um canal privado e entrega a key — sem ticket, sem intervenção humana.

## Arquitetura

```text
[Discord User]
    |  clica "Comprar Vitalício" → escolhe método
    v
[Discord Bot] --POST--> /api/public/bot/create-order (site)
                            |
                            v
                    cria bot_orders row + Stripe/LivePix charge
                            |
                            v
                    devolve { order_id, payment_url, qr_code? }
[Bot] mostra link/QR pro user (DM/ephemeral)
[Bot] subscribe Supabase Realtime em bot_orders WHERE id=order_id

[User paga] → LivePix/Stripe webhook → /api/public/payments/webhook
                                              |
                                              v
                                  marca bot_orders.status='paid',
                                  gera license_key, salva em bot_orders.license_key

[Bot] recebe evento realtime → cria canal #compra-username privado,
                                  posta embed com a key, agenda autodestruct 4h
```

## Pagamentos

- **PIX**: já tem LivePix integrado (`src/lib/livepix.server.ts`). Bot mostra QR code + copia-cola direto na DM.
- **Cartão + PayPal**: Stripe Hosted Checkout (não-embedded, link que abre no navegador). Stripe suporta PayPal nativamente como payment method — basta passar `payment_method_types: ['card', 'paypal']` na criação da Session. Um único link cobre os 2 métodos, simplificando muito.

## Mudanças no site (este projeto)

### 1. Nova tabela `bot_orders` (migration)
```sql
create table public.bot_orders (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null,
  plan_id text not null,           -- '1day' | '1week' | '30days' | 'lifetime'
  method text not null,            -- 'pix' | 'stripe'
  amount_brl numeric not null,
  status text not null default 'pending',  -- pending | paid | expired | failed
  payment_provider_id text,        -- livepix charge id ou stripe session id
  payment_url text,
  license_key text,
  created_at timestamptz default now(),
  paid_at timestamptz
);
-- realtime + grants + RLS service_role only
```

### 2. Novo endpoint `POST /api/public/bot/create-order`
- Body: `{ discord_id, plan_id, method, bot_secret }`
- Valida `bot_secret` contra env `DISCORD_BOT_SECRET` (novo secret)
- Cria row em `bot_orders`
- Se `method='pix'`: chama LivePix, devolve `{ qr_image, copy_paste, order_id }`
- Se `method='stripe'`: cria Stripe Checkout Session **hosted** (não-embedded) com `payment_method_types: ['card', 'paypal']` e `success_url`, devolve `{ payment_url, order_id }`
- Metadata: `{ bot_order_id: <id>, discord_id }`

### 3. Webhook handler atualizado
- `src/routes/api/public/payments/webhook.ts` e LivePix webhook: quando recebem payment success com metadata `bot_order_id`, geram license_key via `generate_license_key_by_duration`, salvam em `license_keys` e atualizam `bot_orders.status='paid'` + `license_key`. Realtime publica a mudança automaticamente.

### 4. Secret novo
- `DISCORD_BOT_SECRET` — chave compartilhada entre bot e site pra autenticar requests.

## Mudanças no bot (repo `botdiscordGUTO`)

Como não tenho acesso pra commitar no GitHub, vou gerar o código novo do bot em `/mnt/documents/bot_index_update.js` pra você colar/mergeear no `index.js` do repo. Vai incluir:

- Comando `/setup-shop` (envia painel com 4 botões: 1 Dia / 1 Semana / 30 Dias / Vitalício)
- Handler de clique de plano: abre menu efêmero com 2 botões (PIX / Cartão+PayPal)
- Handler de método: chama `POST /api/public/bot/create-order`, mostra QR (PIX) ou link (Stripe) na resposta efêmera
- Subscription Supabase Realtime no canal `bot_orders` filtrado por `discord_id` do user. Quando `status='paid'`:
  - cria canal privado `compra-<username>`
  - posta embed com a key
  - agenda deleção em 4h (já tem cleanup similar pro trial)

Env vars novas no bot: `LOVABLE_API_BASE` (URL do site) + `DISCORD_BOT_SECRET` (mesma do site).

## Trial mantido

O painel `/setup-support` atual fica intocado. `/setup-shop` é separado pra compras.

## Detalhes técnicos

- Stripe API version: `2026-03-25.dahlia` (pinned)
- PayPal só funciona em moedas suportadas pela conta Stripe; vou configurar BRL com fallback
- Realtime: habilitar `bot_orders` em `supabase_realtime` publication
- Idempotência: webhook upsert por `payment_provider_id`
- Order TTL: status `expired` após 30 min sem pagamento (cleanup opcional, não bloqueante)

## Entrega

1. Aplico tudo no site (migration + endpoint + webhook + secret request)
2. Crio o arquivo `/mnt/documents/bot_index_update.js` com o código pro você colar no repo do bot
3. Te passo um README curto com: o que mudou no bot, env vars novas, comandos novos