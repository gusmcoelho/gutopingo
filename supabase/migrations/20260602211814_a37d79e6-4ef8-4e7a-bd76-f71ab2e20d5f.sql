-- Tabela para ordens de compra via bot do Discord
CREATE TABLE public.bot_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_id TEXT NOT NULL,
  discord_username TEXT,
  plan_id TEXT NOT NULL,                         -- '1day' | '1week' | '30days' | 'lifetime'
  method TEXT NOT NULL,                          -- 'pix' | 'stripe'
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'brl',
  status TEXT NOT NULL DEFAULT 'pending',        -- pending | paid | expired | failed
  payment_reference TEXT UNIQUE,                 -- LPX_BOT_<...> ou STRIPE_BOT_<session_id>
  payment_url TEXT,
  license_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_bot_orders_discord_id ON public.bot_orders(discord_id);
CREATE INDEX idx_bot_orders_payment_reference ON public.bot_orders(payment_reference);
CREATE INDEX idx_bot_orders_status ON public.bot_orders(status);

-- Tabela só acessada via service_role (bot e webhook). Sem grant pra anon/authenticated.
GRANT ALL ON public.bot_orders TO service_role;

ALTER TABLE public.bot_orders ENABLE ROW LEVEL SECURITY;

-- Sem policies para anon/authenticated -- só service_role acessa.
-- (service_role bypassa RLS por design)

-- Habilita realtime para o bot escutar mudanças
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_orders;
ALTER TABLE public.bot_orders REPLICA IDENTITY FULL;