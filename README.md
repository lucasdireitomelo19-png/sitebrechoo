# Carcamana's Brechó

E-commerce para brechó: loja pública com checkout via PagBank (PagSeguro) e área
administrativa privada para cadastrar produtos, acompanhar insights e gerenciar pedidos.

Preparado para deploy na **Vercel** (Postgres + Blob Storage) ou na **Railway**
(Postgres + disco persistente), mas roda em qualquer ambiente Node com um banco Postgres.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Prisma + Postgres**
- **NextAuth (Auth.js v5)** — login de admin com credenciais (e-mail/senha)
- **PagBank (PagSeguro) Checkout API** — pagamento hospedado (cartão, Pix, boleto).
  Opcional: sem `PAGBANK_TOKEN` configurado, o checkout registra o pedido normalmente e
  avisa o cliente que o pagamento online ainda não está disponível.
- **Vercel Blob** para upload de fotos dos produtos (cai para `public/uploads` em dev local
  sem Blob configurado)
- **Zustand** — carrinho no cliente (persistido em `localStorage`)
- **Recharts** — gráficos no painel de insights

## Primeiros passos (desenvolvimento local)

Requer um Postgres rodando localmente (ou use um Postgres gerenciado, ex: Neon/Supabase,
mesmo em dev).

```bash
npm install
cp .env.example .env   # edite DATABASE_URL e as demais variáveis (veja abaixo)
npx prisma migrate dev # cria as tabelas
npm run db:seed        # cria o admin e produtos de exemplo
npm run dev
```

Acesse a loja em `http://localhost:3000` e o painel em `http://localhost:3000/admin/login`.

Credenciais de admin padrão (definidas em `.env`, mude antes de usar em produção):

- E-mail: `ADMIN_EMAIL` (padrão `admin@brecho.com`)
- Senha: `ADMIN_PASSWORD` (padrão `troque-esta-senha`)

## Deploy na Vercel

1. **Banco de dados**: no dashboard do projeto na Vercel, aba **Storage**, crie um banco
   **Postgres** (Neon, via marketplace da Vercel) e conecte ao projeto — isso já define a
   variável `DATABASE_URL` automaticamente.
2. **Upload de imagens**: na mesma aba **Storage**, crie um **Blob Store** e conecte ao
   projeto — a Vercel injeta `BLOB_READ_WRITE_TOKEN` automaticamente. Sem isso, o upload de
   fotos falha em produção (o sistema de arquivos da Vercel é efêmero).
3. **Variáveis de ambiente** (Project Settings → Environment Variables): defina pelo menos
   `AUTH_SECRET` (gere com `openssl rand -base64 32`), `NEXTAUTH_URL` (a URL pública do seu
   domínio na Vercel), `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Veja a tabela completa abaixo.
4. O build usa o script `vercel-build` (`prisma migrate deploy && next build`), que já roda
   as migrações do banco automaticamente a cada deploy — não precisa rodar nada manual.
5. **Criar o admin em produção**: como não há tela de cadastro, rode o seed uma vez apontando
   para o banco de produção:
   ```bash
   DATABASE_URL="<url do banco de produção>" npm run db:seed
   ```
6. **PagBank**: pode deixar `PAGBANK_TOKEN` em branco para lançar o site sem pagamento online
   — os pedidos continuam sendo registrados e você combina o pagamento manualmente. Quando for
   configurar, veja a seção abaixo e adicione as variáveis do PagBank no projeto.

## Deploy na Railway (alternativa à Vercel)

Diferença principal: a Railway roda o app como um container que fica no ar (não é
serverless), então o upload de fotos pode voltar a usar disco local — não precisa do
Vercel Blob. Só é preciso um **Volume** pra esse disco não se perder a cada deploy.

1. Crie um projeto na Railway a partir deste repositório GitHub (**New Project → Deploy from
   GitHub repo**).
2. Adicione um banco: **New → Database → Add PostgreSQL** no mesmo projeto. A Railway
   disponibiliza a variável de conexão do Postgres automaticamente — no serviço da aplicação,
   em **Variables**, adicione `DATABASE_URL` referenciando o Postgres (`${{Postgres.DATABASE_URL}}`,
   a Railway sugere isso automaticamente ao clicar em "New Variable → Add Reference").
3. **(Opcional, recomendado)** Adicione um **Volume** no serviço da aplicação (aba **Settings
   → Volumes**) montado no caminho `/app/public/uploads`, para as fotos dos produtos
   sobreviverem a redeploys. Sem isso, o upload local funciona mas some no próximo deploy —
   e nesse caso é melhor configurar `BLOB_READ_WRITE_TOKEN` (Vercel Blob funciona de qualquer
   host, não só na Vercel) em vez do disco local.
4. Em **Variables**, defina `AUTH_SECRET`/`NEXTAUTH_SECRET`, `NEXTAUTH_URL` e
   `NEXT_PUBLIC_SITE_URL` (o domínio que a Railway gerar, ou seu domínio próprio),
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
5. A Railway detecta o projeto Next.js automaticamente (Nixpacks) e usa os scripts `build` e
   `start` do `package.json` — o `start` já roda `prisma migrate deploy` antes de subir o
   servidor, então as migrações aplicam sozinhas a cada deploy.
6. **Criar o admin em produção**: mesma ideia da Vercel — rode o seed uma vez apontando para
   a `DATABASE_URL` da Railway:
   ```bash
   DATABASE_URL="<url do banco na Railway>" npm run db:seed
   ```

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Conexão Postgres do Prisma (definida automaticamente pela Vercel/Railway ao conectar o banco) |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Segredo do NextAuth — gere com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL pública do site (usada pelo NextAuth) |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Usadas apenas pelo `prisma/seed.ts` para criar o usuário admin inicial |
| `BLOB_READ_WRITE_TOKEN` | Token do Vercel Blob (definido automaticamente ao conectar um Blob Store na Vercel; funciona a partir de qualquer host, inclusive Railway). Sem ele, uploads salvam em `public/uploads` (precisa de disco persistente — funciona numa VPS ou Railway com Volume; não persiste na Vercel) |
| `PAGBANK_API_URL` | `https://sandbox.api.pagseguro.com` (testes) ou `https://api.pagseguro.com` (produção) |
| `PAGBANK_TOKEN` | Token de autenticação da sua conta PagBank. **Opcional** — sem ele, o checkout avisa o cliente que o pagamento online ainda não está disponível, mas o pedido é registrado normalmente |
| `PAGBANK_NOTIFICATION_URL` | URL pública que o PagBank vai chamar para notificar pagamentos (`/api/webhooks/pagbank`) |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, usada para montar o link de redirecionamento pós-pagamento |

## Configurando o PagBank (PagSeguro) — quando for habilitar pagamento online

1. Crie uma conta em [pagbank.com.br](https://pagbank.com.br) e habilite o ambiente
   **sandbox** em [developer.pagbank.com.br](https://developer.pagbank.com.br) para testar
   sem dinheiro real.
2. Gere um token de API (Conectar aplicação / Minhas aplicações) e defina em `PAGBANK_TOKEN`.
3. `PAGBANK_NOTIFICATION_URL` precisa ser uma URL pública (https) acessível pelo PagBank —
   em produção na Vercel isso já é o caso; em desenvolvimento local você pode usar um túnel
   (ngrok, Cloudflare Tunnel etc.) para testar o webhook de confirmação de pagamento.
4. O fluxo implementado (`src/lib/pagbank.ts`, `src/app/api/checkout`,
   `src/app/api/webhooks/pagbank`) usa a **Checkout API** do PagBank: ao finalizar a compra,
   criamos um pedido `PENDING` no banco, chamamos a API para gerar um link de pagamento
   hospedado e redirecionamos o cliente para lá. Quando o pagamento é confirmado, o PagBank
   chama nosso webhook, que reconsulta a API (nunca confia apenas no payload recebido) e
   atualiza o pedido para `PAID`, baixando o estoque automaticamente.
5. **Importante:** os nomes de campos e o formato de resposta da API do PagBank podem mudar
   entre versões. Antes de ir para produção, valide o fluxo completo no sandbox e confira a
   [documentação oficial](https://developer.pagbank.com.br/reference/criar-checkout).

## Estrutura

```
prisma/schema.prisma        Modelos: User, Category, Product, ProductImage, Order, OrderItem
src/lib/auth.ts             Configuração do NextAuth (login do admin)
src/lib/pagbank.ts          Cliente da Checkout API do PagBank
src/lib/upload.ts           Upload de imagens (Vercel Blob se configurado, senão disco local)
src/lib/actions/            Server Actions do admin (produtos, pedidos)
src/app/(store)/            Loja pública (home, produto, carrinho, checkout, status do pedido)
src/app/admin/              Login e painel administrativo (protegidos por middleware/proxy)
src/app/api/checkout/       Cria o pedido e o checkout no PagBank
src/app/api/webhooks/pagbank/  Recebe notificações de pagamento
```

## Painel administrativo

- **Produtos** — criar, editar, excluir; upload de fotos e categoria livre (digite uma nova
  ou escolha uma existente).
- **Pedidos** — lista com filtro por status, detalhe do pedido e atualização manual de status
  (útil para marcar como enviado/entregue, ou para dar baixa manualmente enquanto o pagamento
  online não está configurado).
- **Painel** — faturamento total, pedidos pendentes/pagos, gráfico de faturamento dos últimos
  14 dias, produtos mais vendidos e pedidos recentes.

## Notas

- Troque `ADMIN_PASSWORD` e gere um `AUTH_SECRET` novo antes de publicar o site.
- Sem `PAGBANK_TOKEN`, o site funciona normalmente (catálogo, carrinho, pedidos), só o
  pagamento online fica indisponível — o cliente vê um aviso claro e o pedido é registrado
  para você combinar o pagamento manualmente.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm run start` — build e servidor de produção
- `npm run vercel-build` — usado automaticamente pela Vercel (roda migrações + build)
- `npm run lint` — ESLint
- `npm run db:seed` — cria/atualiza o admin e produtos de exemplo
- `npm run db:migrate` — roda migrações do Prisma em desenvolvimento
- `npm run db:studio` — abre o Prisma Studio para inspecionar o banco
