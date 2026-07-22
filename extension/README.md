# SatVantage Copiloto — extensão Chrome (MVP)

Extensão **independente** do app SatVantage. Lê só o texto visível da aba ativa e envia, junto com a sua pergunta, para o backend Next (`/api/extension/analisar`). **Não** acessa sessão, saldo, chave nem cookies da conta SatVantage.

Uso na demo: carregar **sem compactação** em `chrome://extensions`. Não precisa publicar na Chrome Web Store.

## Requisitos

1. Chrome (ou Chromium / Edge baseado em Chromium).
2. App Next do SatVantage rodando localmente (`cd web && npm run dev` → `http://localhost:3000`).
3. Se o backend estiver em outra URL (deploy), edite `API_BASE` em `popup.js` e, se necessário, `host_permissions` em `manifest.json`.

## Instalar (carregar sem compactação)

1. Abra o Chrome e vá em `chrome://extensions`.
2. Ative **Modo do desenvolvedor** (canto superior direito).
3. Clique em **Carregar sem compactação** (Load unpacked).
4. Selecione esta pasta: `extension/` (a pasta que contém o `manifest.json`).
5. O ícone **SatVantage Copiloto** aparece na barra de extensões (pin se quiser).

## Usar na demo

1. Com o Next em `localhost:3000`, abra qualquer site http/https (ex.: página de exchange, tutorial de carteira, post suspeito).
2. Clique no ícone da extensão.
3. Escolha uma sugestão (**Isso é golpe?** / **Como crio uma carteira aqui?**) ou digite uma pergunta livre.
4. Clique em **Analisar página**.
5. Veja o nível de risco (verde / amarelo / vermelho), a explicação e os próximos passos.

Não funciona em páginas internas do Chrome (`chrome://…`, Chrome Web Store, PDF embutido sem texto, etc.).

## O que é enviado ao servidor

Somente:

- texto visível da página (até ~8000 caracteres);
- a pergunta digitada;
- título e URL da aba (contexto público).

Nada de login SatVantage, NWC, nsec, mnemonic ou saldo.

## Arquivos

| Arquivo        | Função                                      |
| -------------- | ------------------------------------------- |
| `manifest.json`| Manifest V3 (`activeTab`, `scripting`)      |
| `content.js`   | Extrai `document.body.innerText`            |
| `popup.html`   | Interface do popup                          |
| `popup.js`     | Pergunta → API → mostra risco               |
| `popup.css`    | Estilo do popup                             |

Backend (projeto Next, pasta `web/`): `app/api/extension/analisar/route.ts`.

## Remover

Em `chrome://extensions`, remova **SatVantage Copiloto**.
