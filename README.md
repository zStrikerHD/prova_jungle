# Kurio NFT Marketplace

Marketplace de NFTs em React e TypeScript. Toda a demonstração funciona localmente com REST/MSW e Socket.IO simulado; não há conexão com blockchain, extensão de carteira ou pagamento real.

## Requisitos e execução

- Node.js 22+
- npm 10+
- Google Chrome ou Chromium

```bash
npm install
npm run dev
```

Credenciais fictícias:

- `alpha@kurio.test` / `Kurio123!`
- `beta@kurio.test` / `Kurio123!`

Comandos:

```bash
npm run dev                 # desenvolvimento com MSW
npm run build               # typecheck e build de produção
npm run build:demo          # build com mocks para demonstração
npm run preview             # preview do último build
npm run typecheck
npm run lint
npm run test:e2e            # Chrome desktop e mobile
npm run test:visual         # regressão visual
npm run audit:lighthouse    # três medições, mobile e desktop
```

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `VITE_ENABLE_MOCKS=true` | Ativa MSW fora do modo development |
| `VITE_API_URL=/api` | Base REST |
| `VITE_SOCKET_URL` | Origem opcional do Socket.IO |

O modo `demo` já ativa os mocks por meio de `.env.demo`.

## Cenários e reset

O estado simulado é persistido no navegador e isolado por usuário. Para restaurar catálogo, sessões, carrinhos, favoritos, carteiras e pedidos:

```js
await fetch('/api/test/reset', { method: 'POST' })
```

O cupom válido é `12345` (15%). Códigos diferentes retornam 422. Alterações em tempo real podem ser disparadas nos testes por `PATCH /api/test/nfts/:id`, enviando `priceEth` e/ou `availableEditions`. O endpoint atualiza o REST e publica `nft.updated`.

Os cenários `slow`, `network-error`, `session-expired`, `payment-declined` e `order-timeout` são selecionados com `localStorage.setItem('kurio_mock_scenario', nome)`. Remova a chave para voltar ao cenário padrão.

## Contratos principais

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout`
- `GET /api/nfts`, `GET /api/nfts/:id`, `POST /api/nfts/:id/favorite`
- `GET|PUT /api/cart`, `GET|POST /api/favorites`
- `POST /api/quotes`
- `POST /api/orders` com header `Idempotency-Key`; `GET /api/orders/:id`
- `GET|PATCH /api/profile`, `POST /api/profile/password`
- `GET|POST|PUT /api/wallets`

Erros usam JSON `{ "message": string }` e status 401, 404, 409, 422 ou 5xx conforme o cenário. Valores ETH trafegam como strings decimais. Consulte [ARCHITECTURE.md](./ARCHITECTURE.md) para cache, sessão, idempotência e tempo real.

## Deploy

`vercel.json` executa o build de demonstração e configura fallback de SPA. A URL publicada deve usar exatamente o commit entregue e permanecer com os mocks ativados.
