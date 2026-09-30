# WhatsApp dinâmico (Evolution API)

Cada empresa liga o próprio número em **Ajustes → WhatsApp → QR code pelo painel**. O painel cria uma instância `royal-<slug>` na Evolution, mostra o QR e a assistente responde.

```
Celular do cliente ⇄ Evolution (Docker, seu PC) ⇄ Cloudflare Tunnel ⇄ Supabase (função whatsapp) ⇄ painel
```

## Subir no PC
1. `copy .env.exemplo .env` e preencha (chave mestra, senha do Postgres, token do túnel, URL pública).
2. `docker compose up -d`
3. Teste: abrir `https://SEU-HOST/` deve responder um JSON da Evolution.

## Secrets do Supabase (uma vez)
```
npx supabase secrets set EVOLUTION_URL=https://wa.royalimobhub.com.br EVOLUTION_API_KEY=<a mesma do .env> --project-ref ntligarirvohzrhrpqrp   # já aplicado
npx supabase functions deploy whatsapp --project-ref ntligarirvohzrhrpqrp
```

## Limites
- PC desligado = todos os bots param. Sessões ficam no volume `evolution_pg` (faça backup).
- Não é a API oficial: mantenha os atrasos e evite disparo em massa.
