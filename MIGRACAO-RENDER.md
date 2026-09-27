# 🚀 Guia de Migração: Replit ➔ Render.com com MariaDB (PROFAC)

Este documento descreve como colocar o site **profac.com.br** para rodar no **Render** (plano gratuito), conectando-se diretamente ao **MariaDB** do seu próprio domínio/hospedagem (cPanel / phpMyAdmin) para iniciar com o banco zerado e **sem nenhum custo de banco ou manutenção**.

---

## 🛠️ O Que Foi Adaptado no Projeto para MariaDB

1. **Driver MariaDB/MySQL:**
   - Adicionada a biblioteca `mysql2` com pool de conexões otimizado e charset `utf8mb4` (acentuação e emojis).
   - Configurado o Drizzle ORM (`drizzle-orm/mysql2` e `drizzle-orm/mysql-core`).

2. **Esquema de Tabelas (`shared/schema.ts`):**
   - Todas as 16 tabelas convertidas de PostgreSQL (`pgTable`) para MariaDB (`mysqlTable`).
   - Campos únicos com tamanho correto para InnoDB (`varchar(255)`, `varchar(20)`, etc.).
   - Arrays convertidos para campos `JSON` nativos.

3. **Camada de Dados (`server/storage.ts`):**
   - Removido o uso de `.returning()` (específico do Postgres) e substituído pelo fluxo compatível com MariaDB (`insertId` e consultas automáticas).
   - Consultas de estatísticas e gráficos ajustadas para usar a função `DATE_FORMAT()` do MariaDB.

4. **Script SQL Criado:**
   - Criado o arquivo [banco_mariadb.sql](file:///c:/PROJETOS/RenderPROFACW/banco_mariadb.sql) pronto para importar no **phpMyAdmin**.

---

## 📋 Passo 1: Criar o Banco e Tabelas no seu Domínio (phpMyAdmin)

1. Acesse o **cPanel** (ou painel de controle) da sua hospedagem do seu domínio.
2. Vá em **"Bancos de Dados MySQL"** (ou MariaDB):
   - Crie um novo banco de dados (ex: `profac_db`).
   - Crie um usuário para o banco (ex: `profac_user`) com uma senha forte.
   - Associe o usuário ao banco com **Todos os Privilégios** (*ALL PRIVILEGES*).
3. Abra o **phpMyAdmin**:
   - Selecione o banco de dados que você acabou de criar.
   - Clique na aba **"Importar"** (ou abra a aba **"SQL"**).
   - Envie ou copie e cole o conteúdo do arquivo [banco_mariadb.sql](file:///c:/PROJETOS/RenderPROFACW/banco_mariadb.sql).
   - Clique em **"Executar"** / **"Go"**.
   - ✅ Todas as 16 tabelas serão criadas instantaneamente!

---

## 🌐 Passo 2: Liberar o Acesso Remoto no cPanel

Como o Render roda na nuvem, ele precisa de permissão para falar com o MariaDB do seu domínio:

1. No painel do seu cPanel, procure por **"MySQL Remoto"** (ou *Remote MySQL*).
2. No campo **Host (ou IP)**, digite: `%`
   *(O símbolo `%` é um coringa que autoriza conexões que tenham o usuário e senha corretos do banco).*
3. Clique em **"Adicionar Host"**.

---

## 🔑 Passo 3: Montar a sua `DATABASE_URL`

A URL de conexão para o MariaDB deve seguir este formato simples:

```text
mysql://USUARIO:SENHA@SEU_HOST:3306/NOME_DO_BANCO
```

### Exemplo real:
Se no seu cPanel você tem:
- **Host:** `mysql.profac.com.br` (ou o IP do seu servidor, ex: `162.241.123.45`)
- **Porta:** `3306` (porta padrão do MySQL/MariaDB)
- **Usuário:** `meudominio_profac`
- **Senha:** `MinhaSenhaSegura123#`
- **Banco:** `meudominio_profacdb`

Sua `DATABASE_URL` será:
```text
mysql://meudominio_profac:MinhaSenhaSegura123#@mysql.profac.com.br:3306/meudominio_profacdb
```

---

## 🚀 Passo 4: Configurar no Render.com

Na tela de criação do **Web Service** no Render (ou em **Settings ➔ Environment Variables**):

| Campo | Valor |
| :--- | :--- |
| **Name** | `profac-site` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | `Free` ($0/mês) |

### Em "Environment Variables", adicione:
1. `NODE_ENV` ➔ `production`
2. `APP_URL` ➔ `https://profac.com.br`
3. `SESSION_SECRET` ➔ `profac-chave-secreta-2026-segura`
4. `DATABASE_URL` ➔ *(Cole a URL do MariaDB que você montou no Passo 3)*

Clique em **"Create Web Service"** (ou "Save Changes").

---

## 👥 Primeiro Acesso e Super Admin

Como o banco começará com dados zerados:
1. Acesse o site no ar e vá na tela de **Registro / Login** (`/auth` ou `/login`).
2. Cadastre o primeiro usuário usando o e-mail:
   `contato@profac.com.br`
3. O sistema reconhece automaticamente o e-mail `contato@profac.com.br` como **Super Administrador** com acesso total a todas as telas do painel administrativo (`/admin`).
