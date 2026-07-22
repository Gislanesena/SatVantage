# Cron de herança (Vercel)

O `vercel.json` agenda `GET/POST` diário em `/api/heranca/verificar-inatividade`
às 12:00 UTC.

A Vercel Cron chama a rota com método GET por padrão em alguns planos; a rota
atual aceita **POST**. Se o cron da Vercel enviar GET, configure um Job externo
(ou um rewrite) para POST com o header:

```
x-cron-secret: <mesmo valor de CRON_SECRET no .env>
```

Variáveis necessárias (ver `.env.example`):

- `CRON_SECRET`
- `RESEND_API_KEY` (e opcionalmente `RESEND_FROM`)
- `SATVANTAGE_SERVICE_NSEC` (opcional, DM Nostr)
- `NEXT_PUBLIC_APP_URL` ou `APP_URL` (links nos e-mails)

Migração SQL: `supabase/migration_heranca.sql` (André roda no Supabase).
