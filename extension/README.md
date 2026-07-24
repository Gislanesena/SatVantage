# SatVantage Copiloto — extensão Chrome (MVP)

Extensão **independente** do app SatVantage. Lê o texto (e opcionalmente uma captura) da aba ativa e envia, junto com a sua pergunta, para o backend Next. **Não** acessa sessão, saldo, chave nem cookies da conta SatVantage.

Também mostra a **cotação do Bitcoin** via `GET /api/market/btc` (CoinGecko, sem chave).

**Site oficial:** https://sat-vantage-gislanesena.vercel.app/  
Quando a aba é esse domínio (ou `localhost` em dev), o Copiloto usa o **mapa do site**.

## Instalar

1. `chrome://extensions` → **Modo do desenvolvedor**
2. **Carregar sem compactação** → pasta `extension/`
3. Após mudanças: **Atualizar** a extensão

## Usar

1. Clique no ícone (popup clássico).
2. **Analisar página** / **Selecionar área** — como antes.
3. **Preço do Bitcoin** (botão ou chip) — cotação BRL/USD no painel.

Backend: `app/api/extension/analisar`, `analisar-imagem`, `app/api/market/btc`.
