Vou corrigir o erro no botão de compra, remover o botão de suporte conforme solicitado e implementar o sistema de checkout real usando o Lovable Cloud (Stripe).

### Mudanças Solicitadas
1. **Remover o botão "SUPORTE"** ao lado de "COMPRAR KEY" no herô.
2. **Corrigir o erro no checkout**: O erro ocorre porque o código atual tenta chamar um endpoint inexistente. Vou migrar para o padrão oficial do Lovable Cloud.

### Mudanças Técnicas (Bastidores)
1. **Configuração do Stripe**:
   - Criar `src/lib/stripe.server.ts` para gerenciar a comunicação segura com o Stripe via Gateway do Lovable.
   - Atualizar `src/lib/payments.functions.ts` para usar o SDK oficial do Stripe.
2. **Webhook de Pagamento**:
   - Refatorar o webhook em `src/routes/api/public/payments/webhook.ts` para verificar assinaturas reais do Stripe e garantir segurança.
   - Ajustar o mapeamento de produtos para os novos Price IDs criados.
3. **Autenticação**:
   - Habilitar auto-confirmação de email (como sugerido para facilitar a compra).
4. **Banco de Dados**:
   - Adicionar permissões (GRANT) para que o sistema consiga inserir keys automaticamente após o pagamento.

### Como Testar
- No ambiente de preview, clique em "COMPRAR KEY".
- Você será redirecionado para o Stripe em modo de teste (Sandbox).
- Use o cartão de teste do Stripe: **4242 4242 4242 4242**, qualquer validade futura e CVC 123.
- Após o pagamento, você voltará ao site e sua nova chave aparecerá na seção "SUAS KEYS ATIVAS".

---
**Detalhes Técnicos para Implementação:**
- Implementação de `createStripeClient` com proxy gateway.
- Webhook com `verifyWebhook` (HMAC-SHA256).
- Migração SQL para permissões da tabela `license_keys`.
- Atualização do componente `GutoPingoPage` no index.tsx.
