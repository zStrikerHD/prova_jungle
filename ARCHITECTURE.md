# Arquitetura

## Transporte e estado

A interface usa Axios exclusivamente para REST. O MSW mantém uma fonte de verdade persistente para usuários, sessões, NFTs, carrinhos, favoritos, carteiras e pedidos. TanStack Query controla catálogo, detalhe, mutations otimistas e invalidações; TanStack Router controla rotas e parâmetros de busca.

A sessão usa um token fictício expirável. Somente o token fica no `localStorage`; senhas são persistidas como verificadores não reversíveis no mock. Rotas privadas validam `GET /auth/session`. Logout remove o token, limpa o Query Cache e encerra o Socket.IO.

O carrinho visitante usa uma chave separada. Após login, ele é combinado com o carrinho do usuário, respeitando disponibilidade. Dados autenticados são indexados por `userId`.

## Compra e idempotência

O checkout cria uma cotação temporária e exige nova confirmação do usuário. O pedido exige `Idempotency-Key`. Repetir a mesma tentativa devolve o mesmo pedido; reutilizar a chave com conteúdo diferente retorna 409. O recibo usa o snapshot do pedido. O carrinho só é limpo quando o pedido alcança `confirmed`.

## Cache e falhas

Consultas ficam frescas por um minuto, permanecem no cache por dez e repetem no máximo duas vezes, exceto 404. Mutations não repetem automaticamente. Favoritos usam atualização otimista com rollback. Respostas REST são a fonte de reconciliação após refresh ou reconexão.

## Socket.IO

O cliente é `socket.io-client` em transporte WebSocket. O mock usa `@mswjs/socket.io-binding`. Os eventos são `nft.updated` e `order.updated`, com `resourceId` e `version`. O cliente ignora versões antigas/duplicadas e rejeita eventos de outro usuário. Após reconexão, queries ativas são invalidadas e reconciliadas com REST.

Limitação do mock: rooms, namespaces e broadcast avançado não são simulados pelo binding. Isso não afeta os dois eventos exigidos.

## UX e acessibilidade

Estados fora do Figma reutilizam cores e espaçamentos existentes. A compra vazia é bloqueada; erros não aparentam sucesso. Modais expõem semântica de diálogo e mensagens assíncronas usam regiões vivas. Imagens relevantes mantêm texto alternativo.
