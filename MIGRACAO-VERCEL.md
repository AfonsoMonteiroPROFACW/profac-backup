# 🚀 Guia de Migração: Replit ➔ Vercel com MySQL / MariaDB (PROFAC)

Este documento detalha o processo de migração completa da aplicação PROFAC:
1. **Ambiente de Hospedagem:** Replit ➔ **Vercel** (com Frontend Vite/React em Edge CDN e Backend Express em Serverless Functions).
2. **Banco de Dados:** PostgreSQL ➔ **MySQL / MariaDB** (utilizando Drizzle ORM + mysql2 + `express-mysql-session`).

---

## 📋 Sumário
1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estrutura de Arquivos Criada](#2-estrutura-de-arquivos-criada)
3. [Configuração do Banco de Dados MySQL](#3-configuração-do-banco-de-dados-mysql)
4. [Deploy na Vercel (Passo a Passo)](#4-deploy-na-vercel-passo-a-passo)
5. [Variáveis de Ambiente](#5-variáveis-de-ambiente)
6. [Persistência de Sessões em Serverless](#6-persistência-de-sessões-em-serverless)
7. [Dicas e Resolução de Problemas](#7-dicas-e-resolução-de-problemas)

---

## 1. Visão Geral da Arquitetura

Na Vercel:
- **Frontend SPA (Vite + React):** É compilado e servido estaticamente diretamente na CDN global de alta velocidade da Vercel.
- **Backend API (Express):** Roda como uma **Serverless Function** (`api/index.ts`), acionada automaticamente para todas as rotas `/api/*`.
- **Banco de Dados (MySQL):** Conexão via pool otimizado para Serverless (`server/db.ts`), compatível com SSL e com reconexão automática.
- **Gerenciador de Sessões:** Utiliza a tabela `sessions` no MySQL (`express-mysql-session`), garantindo que o login persista entre diferentes invocações serverless.

---

## 2. Estrutura de Arquivos Criada

- [`vercel.json`](file:///c:/PROJETOS/RenderPROFACW/vercel.json): Configuração do Vercel com rewrites para `/api/(.*)` e fallback SPA para `/index.html`.
- [`api/index.ts`](file:///c:/PROJETOS/RenderPROFACW/api/index.ts): Ponto de entrada Serverless da Vercel que inicializa e executa o Express.
- [`server/app.ts`](file:///c:/PROJETOS/RenderPROFACW/server/app.ts): Configuração centralizada do Express, middlewares, segurança, sessões no MySQL e registro assíncrono de rotas.
- [`server/index.ts`](file:///c:/PROJETOS/RenderPROFACW/server/index.ts): Executável para ambiente local e desenvolvimento (`npm run dev`).
- [`server/db.ts`](file:///c:/PROJETOS/RenderPROFACW/server/db.ts): Pool MySQL com suporte inteligente a SSL, TiDB, PlanetScale, AWS RDS e adaptação de limites serverless.
- [`banco_mysql.sql`](file:///c:/PROJETOS/RenderPROFACW/banco_mysql.sql): Script DDL completo com todas as 16 tabelas do sistema + tabela `sessions`.

---

## 3. Configuração do Banco de Dados MySQL

Você pode hospedar o MySQL em qualquer provedor de sua preferência:

### Opções Recomendadas na Nuvem:
1. **TiDB Cloud (Serverless):** Plano gratuito generoso, compatível 100% com MySQL, com alta disponibilidade e SSL nativo.
2. **PlanetScale:** Provedor serverless MySQL de alto desempenho.
3. **Aiven / Clever Cloud:** Instâncias MySQL/MariaDB gerenciadas.
4. **AWS RDS / DigitalOcean / Railway:** Bancos MySQL dedicados ou serverless.

### Executando o Script DDL:
Execute o script [`banco_mysql.sql`](file:///c:/PROJETOS/RenderPROFACW/banco_mysql.sql) no seu cliente MySQL (DBeaver, MySQL Workbench, phpMyAdmin ou linha de comando):

```bash
mysql -h SEU_HOST -u SEU_USUARIO -p SEU_BANCO < banco_mysql.sql
```

---

## 4. Deploy na Vercel (Passo a Passo)

### Opção A: Pelo Painel Web da Vercel (Recomendado)
1. Envie suas alterações para o seu repositório GitHub (`git push origin main`).
2. Acesse [vercel.com](https://vercel.com) e faça login.
3. Clique em **"Add New..."** ➔ **"Project"**.
4. Importe o repositório do projeto.
5. As configurações de build serão detectadas automaticamente pelo [`vercel.json`](file:///c:/PROJETOS/RenderPROFACW/vercel.json):
   - **Framework Preset:** Vite
   - **Build Command:** `vite build` (ou `npm run build`)
   - **Output Directory:** `dist/public`
6. Expanda a seção **"Environment Variables"** e adicione as variáveis necessárias (veja a lista abaixo).
7. Clique em **"Deploy"**.

### Opção B: Pela Vercel CLI
```bash
# 1. Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# 2. Fazer login e deploy
vercel
```

---

## 5. Variáveis de Ambiente

Configure estas variáveis no painel da Vercel (**Project Settings ➔ Environment Variables**):

| Variável | Exemplo de Valor | Descrição |
| :--- | :--- | :--- |
| `DATABASE_URL` | `mysql://usuario:senha@host:3306/banco?ssl={"rejectUnauthorized":true}` | URL de conexão completa do MySQL |
| `SESSION_SECRET` | `sua-chave-secreta-super-forte-2026` | Chave para assinar cookies de sessão |
| `APP_URL` | `https://seu-projeto.vercel.app` | URL pública da sua aplicação |
| `NODE_ENV` | `production` | Ambiente de execução |
| `SENDGRID_API_KEY` | `SG.xxxxxxxx` | Chave para envio de e-mails via SendGrid (opcional) |
| `ADMIN_PASSWORD` | `senha-segura-admin` | Senha padrão inicial para o admin (se aplicável) |

> **Nota sobre conexões separadas:** Se preferir não usar `DATABASE_URL`, você pode definir `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD` e `MYSQL_DATABASE`.

---

## 6. Persistência de Sessões em Serverless

Em arquiteturas serverless (como a Vercel), cada requisição pode ser atendida por uma instância/lambda diferente. Para evitar perda de autenticação, o PROFAC utiliza o **`express-mysql-session`**, que salva as sessões diretamente na tabela `sessions` do seu banco MySQL.

Assim, quando o usuário faz login, a sessão fica acessível instantaneamente para todas as invocações serverless.

---

## 7. Dicas e Resolução de Problemas

- **Erro de Certificado SSL no MySQL:** O conector [`server/db.ts`](file:///c:/PROJETOS/RenderPROFACW/server/db.ts) já está pré-configurado com `{ rejectUnauthorized: false }` para ambientes de nuvem remota com SSL. Se precisar forçar SSL, adicione a variável `MYSQL_SSL=true`.
- **Limite de Conexões:** Funções serverless escalam sob demanda. O conector foi ajustado para `connectionLimit: 3` quando executado na Vercel para não saturar o pool do MySQL.
