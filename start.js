#!/usr/bin/env node

// Script de inicialização para deploy do PROFAC
const fs = require('fs');
const path = require('path');

console.log('🚀 PROFAC - Sistema de Gestão de Factoring');
console.log('🔧 Verificando build...');

// Verificar se o build existe
const distPath = path.join(process.cwd(), 'dist');
const serverPath = path.join(distPath, 'index.js');
const publicPath = path.join(distPath, 'public');

if (!fs.existsSync(serverPath)) {
  console.log('📦 Build não encontrado, executando...');
  require('child_process').execSync('./deploy.sh', { stdio: 'inherit' });
}

console.log('✅ Build verificado');
console.log('🌐 Iniciando servidor de produção...');

// Definir variáveis de ambiente para produção
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 3000;

// Carregar e executar o servidor
try {
  require('./dist/index.js');
} catch (error) {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
}