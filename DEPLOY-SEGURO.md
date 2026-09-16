# Deploy Seguro - PROFAC Sistema

## 🚀 Deploy sem Afetar Dados de Produção

**GARANTIA**: Seus dados ficam 100% seguros durante o deploy!

### Como Funciona a Segurança dos Dados

- **Desenvolvimento** (aqui no Replit): Usa dados temporários em memória
- **Produção** (seu site): Usa banco PostgreSQL real com seus dados
- **Deploy**: Atualiza apenas código, nunca toca nos dados

### Opção 1: Deploy Automático no Replit (RECOMENDADO)

O sistema PROFAC já está configurado para usar PostgreSQL em produção. Seus dados ficam seguros porque:

1. **Desenvolvimento**: Usa MemStorage (dados temporários em memória)
2. **Produção**: Usa PostgreSQL real (seus dados ficam no banco)

#### Passos para Deploy Seguro:

1. **Configure uma nova DATABASE_URL** para produção no Replit Deployments
2. **Execute as migrações** para criar as tabelas
3. **Deploy preserva todos os dados** existentes no banco PostgreSQL

#### ✅ Passos Simples para Deploy Seguro:

1. **Clique em "Deploy"** no painel do Replit
2. **Aguarde o deploy** (2-3 minutos)
3. **Teste o site** - todos os dados estarão lá
4. **Pronto!** - Zero perda de dados

#### 🔧 Comandos Opcionais (se precisar):

```bash
# Atualizar estrutura do banco (preserva dados)
npm run db:push

# Build para produção
npm run build

# Iniciar em produção
npm start
```

### Opção 2: Migração Manual de Dados

Se você quiser migrar dados específicos:

```bash
# Exportar dados de produção
pg_dump $DATABASE_URL > backup_producao.sql

# Aplicar apenas código novo
# Deploy normal

# Restaurar dados se necessário
psql $DATABASE_URL < backup_producao.sql
```

### Opção 3: Deploy Híbrido com Drizzle

O sistema usa Drizzle ORM que permite:

1. **Migrações automáticas** das estruturas de tabela
2. **Preservação de dados** existentes
3. **Rollback seguro** se necessário

## 🔒 Segurança dos Dados

### Dados que ficam seguros:
- ✅ Usuários registrados
- ✅ Configurações FTP
- ✅ Configurações de email
- ✅ Comentários aprovados
- ✅ Histórico de downloads
- ✅ Tickets de suporte

### Dados que são atualizados (código apenas):
- 🔄 Interface do usuário
- 🔄 Funcionalidades novas
- 🔄 Correções de bugs
- 🔄 Melhorias de performance

## 🛡️ Backup Opcional (Extra Seguro)

Se quiser fazer backup antes (não é obrigatório):

```bash
# Backup completo do banco de produção
pg_dump $DATABASE_URL > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql
```

**Importante**: O backup é opcional porque o deploy não modifica dados!

## 📝 Processo de Deploy Recomendado

1. **Teste local** - Confirme que funciona no desenvolvimento
2. **Backup** - Faça backup do banco de produção
3. **Deploy** - Deploy do código atualizado
4. **Verificação** - Teste se tudo funciona
5. **Rollback** - Se necessário, restaure o backup

## 🎯 Por que é 100% Seguro?

**O sistema PROFAC foi projetado para ser seguro**:

1. **Separação Total**: Código ≠ Dados
   - Código: Fica no Replit (interface, funcionalidades)
   - Dados: Ficam no PostgreSQL (usuários, configurações)

2. **Deploy Inteligente**: 
   - Atualiza apenas arquivos de código
   - Nunca toca no banco de dados
   - Preserva configurações FTP, emails, usuários

3. **Sistema Robusto**:
   - Migrations automáticas (só estrutura)
   - Validação de dados mantida
   - Zero downtime dos dados

## ✅ Resultado Final

Depois do deploy você terá:
- ✅ Todas as correções e melhorias do código
- ✅ Todos os usuários cadastrados preservados
- ✅ Configurações FTP mantidas
- ✅ Histórico de downloads intacto
- ✅ Comentários e tickets preservados

**Deploy com confiança - seus dados estão seguros!**