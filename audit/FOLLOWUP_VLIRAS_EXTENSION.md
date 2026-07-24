# Relatório — VLibras resiliente + extensão unificada

**Data:** 2026-07-24

## VLibras
- Timeout 12s + `onError` do CDN + `try/catch` no init
- Fallback visual (botão Libras) se o plugin falhar — abre painel de a11y
- Posicionamento mobile (`bottom: 128px`) alinhado ao dock
- Strings i18n PT/EN/ES

## Extensão oficial (única)
- **Canônica:** `front/extension/` v**1.0.0**
  - Side Panel, domain-check ampliado, content+security, captura, BTC, Next APIs
- **Descontinuada:** `satmentor/extension/` → só README apontando para `front/extension/`

Carregar no Chrome: `front/extension/`
