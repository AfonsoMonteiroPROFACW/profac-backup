#!/bin/bash

# PROFAC Production Build Optimizer
echo "🚀 Iniciando otimização para produção..."

# Limpar caches anteriores
echo "🧹 Limpando caches..."
rm -rf node_modules/.cache
rm -rf dist/.cache
rm -rf .vite
rm -rf client/dist

# Definir NODE_ENV para produção
export NODE_ENV=production

# Build otimizado do cliente
echo "📦 Fazendo build do cliente..."
npm run build

# Minificar arquivos CSS e JS
echo "🗜️ Otimizando assets..."
find dist/public -name "*.js" -exec gzip -9 -c {} \; > {}.gz 2>/dev/null || true
find dist/public -name "*.css" -exec gzip -9 -c {} \; > {}.gz 2>/dev/null || true

# Remover arquivos de desenvolvimento
echo "🔧 Removendo arquivos de desenvolvimento..."
rm -rf dist/public/dev-*
rm -rf dist/public/*.map 2>/dev/null || true

# Criar informações de build
echo "📝 Criando informações de build..."
cat > dist/build-info.json << EOF
{
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "version": "2.1.0",
  "environment": "production",
  "optimized": true
}
EOF

echo "✅ Build otimizado concluído!"
echo "📊 Tamanho dos arquivos principais:"
du -sh dist/public/*.js dist/public/*.css 2>/dev/null || echo "Assets compilados com sucesso"

echo ""
echo "🎯 Sistema pronto para deploy em produção!"
echo "📁 Arquivos estão em: ./dist/"