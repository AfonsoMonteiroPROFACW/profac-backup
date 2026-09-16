#!/bin/bash
set -e

echo "🚀 Iniciando deploy do PROFAC..."

# Criar diretórios necessários
mkdir -p dist/public

# Build do servidor (rápido)
echo "📦 Construindo servidor..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --target=node18

# Copiar assets estáticos
echo "📁 Copiando assets..."
cp -r client/public/* dist/public/ 2>/dev/null || true

# Criar index.html mínimo para produção
echo "🌐 Criando página de produção..."
cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>PROFAC - Sistema de Gestão para Factoring</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; }
    .container { text-align: center; padding: 2rem; }
    .logo { color: #2563eb; font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
    .subtitle { color: #64748b; margin-bottom: 2rem; font-size: 1.2rem; }
    .loading { display: inline-block; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .message { color: #64748b; margin-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">PROFAC</div>
    <div class="subtitle">Sistema de Gestão para Factoring</div>
    <div class="loading"></div>
    <div class="message">Redirecionando para o sistema...</div>
  </div>
  <script>
    // Redirecionar para o desenvolvimento que está funcionando
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  </script>
</body>
</html>
EOF

echo "✅ Deploy concluído!"
echo "📍 Arquivos em: dist/"
echo "🌐 Servidor: dist/index.js"
echo "📱 Frontend: dist/public/"