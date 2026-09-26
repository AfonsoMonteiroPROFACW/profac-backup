# 🚀 Guia de Migração: Replit ➔ Render.com (PROFAC)

Este documento descreve as etapas para hospedar o site **profac.com.br** no **Render** (plano gratuito), eliminando os custos de manutenção recorrentes do Replit.

---

## 🛠️ O Que Foi Ajustado no Projeto

1. **Desvinculação do Replit:**
   - Remoção do banner do Replit (`replit-dev-banner.js`) do `client/index.html`.
   - Remoção dos plugins restritos do Replit (`@replit/vite-plugin-runtime-error-modal` e `@replit/vite-plugin-cartographer`).
   - Links automáticos nos e-mails (boas-vindas, recuperação de senha, downloads) atualizados para usar a URL de produção (`profac.com.br`) em vez de URLs do `replit.app`.

2. **Compatibilidade de Produção no Render:**
   - Porta dinâmica configurada via `process.env.PORT` no `server/index.ts` (obrigatória para o health check do Render passar).
   - Remoção da flag `reusePort: true` que impedia inicialização em certos ambientes.
   - Suporte universal no banco de dados (`server/db.ts`): compatível tanto com o **Neon PostgreSQL** quanto com o **Render PostgreSQL** nativo, Supabase ou PostgreSQL tradicional.
   - Correção dos tipos TypeScript (`npm run check` e `npm run build` testados e aprovados com 100% de sucesso).
   - Criação do arquivo [render.yaml](file:///c:/PROJETOS/RenderPROFACW/render.yaml) para deploy automático (Blueprint).

---

## 📋 Passo a Passo para o Deploy no Render

### Passo 1: Enviar os arquivos atualizados para o GitHub

No terminal (neste diretório `c:\PROJETOS\RenderPROFACW`), rode os seguintes comandos para subir a versão pronta para o GitHub:

```bash
git add .
git commit -m "Migração Replit para Render: desvinculação, compatibilidade de porta e build otimizado"
git push origin master
```

---

### Passo 2: Criar sua conta gratuita no Render

1. Acesse: **[https://render.com](https://render.com)**
2. Clique em **"Sign Up"** (ou "Log In") e entre usando sua conta do **GitHub** (a mesma conta `AfonsoMonteiroPROFACW`).

---

### Passo 3: Criar o Serviço Web no Render

1. No painel do Render, clique no botão azul **"New +"** no canto superior direito.
2. Selecione **"Web Service"**.
3. Escolha **"Build and deploy from a Git repository"** e clique em **Next**.
4. Conecte o repositório **`AfonsoMonteiroPROFACW/profac-backup`**.
5. Preencha as configurações:
   - **Name:** `profac-site`
   - **Region:** `Oregon (US West)` (ou qualquer região de sua preferência)
   - **Branch:** `master` (ou `main`)
   - **Root Directory:** *(deixe em branco)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** `Free` ($0/mês)

6. Na seção **Environment Variables** (Variáveis de Ambiente), adicione:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` *(o Render preenche automaticamente, mas é bom deixar)*
   - `SESSION_SECRET`: `uma_frase_longa_e_secreta_qualquer` (ex: `profac-segredo-2026-auth-render`)
   - `APP_URL`: `https://profac.com.br`
   - `DATABASE_URL`: *Cole a URL de conexão do seu banco PostgreSQL* (veja o Passo 4 abaixo).

7. Clique em **"Create Web Service"**.
   - O Render iniciará a instalação e o build automaticamente!

---

### Passo 4: O Banco de Dados PostgreSQL

Você tem duas opções 100% gratuitas:

#### Opção A (Recomendada se você já tem os dados no Neon):
Se o seu banco do Replit já estiver no **Neon** (`neon.tech`), basta pegar a mesma string de conexão `DATABASE_URL` (formato `postgresql://usuario:senha@ep-xyz.neon.tech/neondb?sslmode=require`) e colar no campo `DATABASE_URL` do Render. Todos os usuários, downloads e dados continuarão exatamente como estavam!

#### Opção B (Criar novo PostgreSQL grátis no Render):
1. No Render, clique em **"New +"** ➔ **"PostgreSQL"**.
2. Dê o nome `profac-db`, selecione plano `Free`.
3. Após criar, copie a **"Internal Database URL"** (ou External) e use como a variável `DATABASE_URL` do seu Web Service.
4. Para inicializar as tabelas, você pode rodar `npm run db:push` no console do Render.

---

### Passo 5: Apontar o Domínio `profac.com.br` para o Render

Para parar de pagar o Replit e usar seu domínio no Render:

1. No painel do seu Web Service no Render, clique na aba **"Settings"** (à esquerda).
2. Role até a seção **"Custom Domains"** e clique em **"Add Custom Domain"**.
3. Digite: `profac.com.br` e também `www.profac.com.br`.
4. O Render exibirá as instruções de DNS (geralmente um apontamento do tipo `A` e `CNAME`).
5. Acesse o painel onde você registrou o domínio (por exemplo, **Registro.br**, Cloudflare ou seu provedor de DNS) e atualize os registros:
   - Registro tipo **A** para `@` (ou `profac.com.br`) apontando para o IP que o Render indicar (ex: `216.24.57.1`).
   - Registro tipo **CNAME** para `www` apontando para o seu endereço `.onrender.com`.
6. O Render gera o certificado **SSL (HTTPS)** automaticamente de forma gratuita!

---

### Passo 6: Cancelar a Manutenção/Assinatura do Replit

Assim que o domínio `profac.com.br` estiver abrindo normalmente pelo Render:
1. Acesse sua conta no **Replit**.
2. Vá em **Billing / Subscriptions** ou nas configurações do Deployment.
3. Desative o Deployment e cancele o plano pago do Replit.
4. **Pronto!** O site estará funcionando com alta performance no Render sem a cobrança mensal.
