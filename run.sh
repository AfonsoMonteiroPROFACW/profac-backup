#!/bin/bash

echo "🚀 PROFAC - Sistema de Gestão de Factoring"
echo "🔧 Preparando deploy..."

# Verificar e criar build se necessário
if [ ! -f "dist/index.js" ]; then
    echo "📦 Executando build..."
    ./deploy.sh
fi

echo "✅ Build verificado"
echo "🌐 Iniciando servidor de produção na porta ${PORT:-3000}..."

# Iniciar servidor de produção
NODE_ENV=production PORT=${PORT:-3000} node dist/index.js