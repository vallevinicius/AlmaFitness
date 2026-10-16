<div align="center">

# Alma Fitness

**Loja online de uma marca de roupas fitness, com conta de cliente e painel administrativo.**

🇺🇸 [Read in English](README.md)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

</div>

## Sobre

Loja full-stack em Next.js. Clientes navegam pelo catálogo, criam conta e fazem pedidos; a dona da loja gerencia produtos (com upload de imagem) e acompanha os pedidos numa área administrativa protegida.

## Funcionalidades

- Catálogo de produtos e criação de pedidos
- Cadastro, login e página de conta do cliente com endereço estruturado
- Admin: CRUD de produtos, upload de imagem, lista e detalhe de pedidos
- Limite de tentativas de login gravado no MySQL

## Stack

| Camada | Tecnologia |
|---|---|
| App | Next.js 16 (App Router + Route Handlers), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui (Base UI) |
| Dados | MySQL + Prisma 7 (`@prisma/adapter-mariadb`) |
| Autenticação | JWT (`jose`) in httpOnly cookies, `bcryptjs` |

## Segurança

- Sessões separadas para cliente e admin, ambas em cookies httpOnly
- Credenciais do admin comparadas em tempo constante (`timingSafeEqual`)
- Rate limiting de login gravado no banco (`RateLimitAttempt`)

## Como rodar

**Pré-requisitos:** Node.js 20+, MySQL 8

```bash
npm install        # o postinstall roda prisma generate
# crie o .env com as variáveis abaixo
npx prisma migrate deploy
npm run dev        # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão MySQL |
| `SESSION_SECRET` | Segredo que assina os tokens de sessão |
| `ADMIN_USERNAME / ADMIN_PASSWORD` | Credenciais do painel admin |

### Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Aplica migrations e gera o build de produção |
| `npm start` | Servidor de produção |

## Equipe

- [Vinicius do Valle](https://github.com/vallevinicius)
