import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface InviteImageProps {
  onGenerate: (format: 'svg' | 'jpg') => void;
}

export const InviteImageGenerator: React.FC<InviteImageProps> = ({ onGenerate }) => {
  const [style, setStyle] = useState<'modern' | 'formal'>('modern');
  
  const generateModernInvite = () => {
    // A4 landscape 70% = 595 x 420 x 0.7 = 416.5 x 294
    const width = 420;
    const height = 297;
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradientes futuristas -->
          <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
          </linearGradient>
          
          <!-- Efeito 3D -->
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.95" />
            <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:0.9" />
          </linearGradient>
          
          <!-- Sombra -->
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.2"/>
          </filter>
          
          <!-- Padrão de pontos futurista -->
          <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        
        <!-- Fundo futurista -->
        <rect width="100%" height="100%" fill="url(#backgroundGradient)"/>
        <rect width="100%" height="100%" fill="url(#dots)"/>
        
        <!-- Elementos decorativos 3D -->
        <circle cx="50" cy="50" r="30" fill="rgba(255,255,255,0.05)" opacity="0.6"/>
        <circle cx="367" cy="244" r="25" fill="rgba(255,255,255,0.08)" opacity="0.4"/>
        <polygon points="380,20 400,40 360,40" fill="rgba(255,255,255,0.06)"/>
        
        <!-- Card principal -->
        <rect x="20" y="20" width="380" height="257" rx="15" ry="15" 
              fill="url(#cardGradient)" filter="url(#shadow)"/>
        
        <!-- Header -->
        <rect x="20" y="20" width="380" height="60" rx="15" ry="15" 
              fill="linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"/>
        <rect x="20" y="65" width="380" height="15" fill="linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"/>
        
        <!-- Logo/Ícone moderno -->
        <rect x="45" y="35" width="30" height="30" rx="8" ry="8" fill="rgba(255,255,255,0.15)"/>
        <rect x="50" y="40" width="20" height="20" rx="4" ry="4" fill="rgba(255,255,255,0.9)"/>
        <rect x="52" y="42" width="16" height="2" fill="#3b82f6"/>
        <rect x="52" y="46" width="12" height="2" fill="#10b981"/>
        <rect x="52" y="50" width="14" height="2" fill="#8b5cf6"/>
        <rect x="52" y="54" width="10" height="2" fill="#f59e0b"/>
        
        <!-- Título -->
        <text x="85" y="45" fill="white" font-size="14" font-weight="bold" font-family="Arial, sans-serif">
          CONVITE ESPECIAL - PROFAC
        </text>
        <text x="85" y="58" fill="rgba(255,255,255,0.9)" font-size="10" font-family="Arial, sans-serif">
          Sistema de Gestão para Factoring
        </text>
        <text x="85" y="70" fill="rgba(255,255,255,0.8)" font-size="8" font-family="Arial, sans-serif">
          Afonso Monteiro convida você
        </text>
        
        <!-- Mockup moderno da aplicação -->
        <rect x="30" y="95" width="110" height="70" rx="8" ry="8" 
              fill="white" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
        
        <!-- Header da aplicação -->
        <rect x="30" y="95" width="110" height="15" rx="8" ry="8" fill="linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"/>
        <rect x="30" y="105" width="110" height="5" fill="linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"/>
        
        <!-- Ícones da barra superior -->
        <rect x="125" y="98" width="3" height="3" rx="1" fill="white" opacity="0.8"/>
        <rect x="129" y="98" width="3" height="3" rx="1" fill="white" opacity="0.8"/>
        <rect x="133" y="98" width="3" height="3" rx="1" fill="white" opacity="0.8"/>
        
        <!-- Dashboard moderno -->
        <rect x="35" y="115" width="48" height="20" rx="4" fill="linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)"/>
        <rect x="37" y="117" width="8" height="3" fill="#3b82f6"/>
        <rect x="37" y="122" width="12" height="2" fill="#6b7280" opacity="0.5"/>
        <rect x="37" y="126" width="10" height="2" fill="#6b7280" opacity="0.5"/>
        <rect x="37" y="130" width="6" height="2" fill="#10b981"/>
        
        <rect x="87" y="115" width="48" height="20" rx="4" fill="linear-gradient(135deg, #dcfce7 0%, #fef3c7 100%)"/>
        <rect x="89" y="117" width="8" height="3" fill="#10b981"/>
        <rect x="89" y="122" width="12" height="2" fill="#6b7280" opacity="0.5"/>
        <rect x="89" y="126" width="10" height="2" fill="#6b7280" opacity="0.5"/>
        <rect x="89" y="130" width="6" height="2" fill="#f59e0b"/>
        
        <!-- Gráfico moderno -->
        <rect x="35" y="140" width="100" height="20" rx="4" fill="linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)"/>
        <path d="M 40 155 L 45 150 L 50 152 L 55 148 L 60 145 L 65 147 L 70 143 L 75 140" 
              stroke="#3b82f6" stroke-width="2" fill="none"/>
        <path d="M 40 157 L 45 155 L 50 157 L 55 153 L 60 150 L 65 152 L 70 148 L 75 145" 
              stroke="#10b981" stroke-width="2" fill="none"/>
        <circle cx="75" cy="140" r="2" fill="#3b82f6"/>
        <circle cx="75" cy="145" r="2" fill="#10b981"/>
        
        <!-- Seção de texto principal -->
        <text x="155" y="105" fill="#1e293b" font-size="12" font-weight="bold" font-family="Arial, sans-serif">
          🚀 O que você encontrará:
        </text>
        <text x="155" y="118" fill="#475569" font-size="9" font-family="Arial, sans-serif">
          📝 Atualizações e feedback das versões
        </text>
        <text x="155" y="128" fill="#475569" font-size="9" font-family="Arial, sans-serif">
          📊 Histórico completo de versões
        </text>
        <text x="155" y="138" fill="#475569" font-size="9" font-family="Arial, sans-serif">
          🤖 Versão web IA em desenvolvimento
        </text>
        
        <!-- Call to action -->
        <rect x="155" y="160" width="160" height="20" rx="10" ry="10" 
              fill="linear-gradient(135deg, #10b981 0%, #059669 100%)"/>
        <text x="235" y="173" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="Arial, sans-serif">
          🌐 Acesse: profac.com.br
        </text>
        
        <!-- Card 1: Como se cadastrar -->
        <rect x="30" y="190" width="175" height="70" rx="8" ry="8" 
              fill="rgba(59, 130, 246, 0.05)" stroke="rgba(59, 130, 246, 0.2)" stroke-width="1"/>
        <text x="40" y="205" fill="#1e40af" font-size="9" font-weight="bold" font-family="Arial, sans-serif">
          📋 Como se cadastrar:
        </text>
        <text x="40" y="217" fill="#475569" font-size="8" font-family="Arial, sans-serif">
          1) Acesse profac.com.br
        </text>
        <text x="40" y="227" fill="#475569" font-size="8" font-family="Arial, sans-serif">
          2) Clique em "Cadastrar"
        </text>
        <text x="40" y="237" fill="#475569" font-size="8" font-family="Arial, sans-serif">
          3) Preencha seus dados
        </text>
        <text x="40" y="247" fill="#475569" font-size="8" font-family="Arial, sans-serif">
          4) Aguarde aprovação
        </text>
        
        <!-- Card 2: Benefícios -->
        <rect x="215" y="190" width="175" height="70" rx="8" ry="8" 
              fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.2)" stroke-width="1"/>
        <text x="225" y="205" fill="#059669" font-size="9" font-weight="bold" font-family="Arial, sans-serif">
          ⭐ O que você terá:
        </text>
        <text x="225" y="217" fill="#475569" font-size="8" font-family="Arial, sans-serif">
          • Atualizações de versões
        </text>
        <text x="225" y="227" fill="#475569" font-size="8" font-family="Arial, sans-serif">
          • Sistema de feedback
        </text>
        <text x="225" y="237" fill="#475569" font-size="8" font-family="Arial, sans-serif">
          • Histórico completo
        </text>
        <text x="225" y="247" fill="#475569" font-size="8" font-family="Arial, sans-serif">
          • Futuro sistema web IA
        </text>
        
        <!-- Footer -->
        <text x="30" y="275" fill="#64748b" font-size="7" font-family="Arial, sans-serif">
          📧 contato@profac.com.br • PROFAC - Facilitando atualizações, feedback e histórico de versões
        </text>
        
        <!-- Elementos decorativos finais -->
        <circle cx="340" cy="110" r="12" fill="rgba(59, 130, 246, 0.1)"/>
        <circle cx="360" cy="140" r="8" fill="rgba(16, 185, 129, 0.1)"/>
        <circle cx="370" cy="200" r="10" fill="rgba(139, 92, 246, 0.1)"/>
      </svg>
    `;
  };

  const generateFormalInvite = () => {
    // A4 landscape 70% = 595 x 420 x 0.7 = 416.5 x 294
    const width = 420;
    const height = 297;
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradiente suave e formal -->
          <linearGradient id="formalBackground" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
          </linearGradient>
          
          <!-- Bordas elegantes -->
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#334155;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#1e293b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#334155;stop-opacity:1" />
          </linearGradient>
          
          <!-- Sombra sutil -->
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.1"/>
          </filter>
        </defs>
        
        <!-- Fundo formal -->
        <rect width="100%" height="100%" fill="url(#formalBackground)"/>
        
        <!-- Borda principal -->
        <rect x="15" y="15" width="390" height="267" rx="8" ry="8" 
              fill="white" stroke="url(#borderGradient)" stroke-width="2" filter="url(#softShadow)"/>
        
        <!-- Linha decorativa superior -->
        <rect x="25" y="25" width="370" height="3" fill="url(#borderGradient)"/>
        
        <!-- Cabeçalho formal -->
        <text x="210" y="50" text-anchor="middle" fill="#1e293b" font-size="18" font-weight="bold" font-family="Georgia, serif">
          PROFAC
        </text>
        <text x="210" y="68" text-anchor="middle" fill="#475569" font-size="12" font-family="Georgia, serif">
          Sistema de Gestão para Factoring
        </text>
        
        <!-- Linha divisória -->
        <line x1="80" y1="80" x2="340" y2="80" stroke="#cbd5e1" stroke-width="1"/>
        
        <!-- Título do convite -->
        <text x="210" y="105" text-anchor="middle" fill="#1e293b" font-size="16" font-weight="bold" font-family="Georgia, serif">
          CONVITE ESPECIAL
        </text>
        
        <!-- Texto principal -->
        <text x="210" y="130" text-anchor="middle" fill="#334155" font-size="11" font-family="Georgia, serif">
          Afonso Monteiro tem o prazer de convidá-lo para acessar
        </text>
        <text x="210" y="145" text-anchor="middle" fill="#334155" font-size="11" font-family="Georgia, serif">
          nosso site para atualizações, feedback e histórico de versões
        </text>
        
        <!-- Benefícios em formato elegante -->
        <text x="60" y="175" fill="#1e293b" font-size="10" font-weight="bold" font-family="Georgia, serif">
          O que você encontrará:
        </text>
        
        <!-- Lista de benefícios -->
        <text x="60" y="195" fill="#475569" font-size="9" font-family="Georgia, serif">
          • Atualizações de versões facilitadas
        </text>
        <text x="60" y="208" fill="#475569" font-size="9" font-family="Georgia, serif">
          • Sistema de feedback e sugestões
        </text>
        <text x="60" y="221" fill="#475569" font-size="9" font-family="Georgia, serif">
          • Histórico completo de versões
        </text>
        <text x="60" y="234" fill="#475569" font-size="9" font-family="Georgia, serif">
          • Futura versão web desenvolvida por IA
        </text>
        
        <!-- Call to action formal -->
        <rect x="140" y="250" width="140" height="22" rx="4" ry="4" 
              fill="#1e293b" stroke="#334155" stroke-width="1"/>
        <text x="210" y="265" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="Georgia, serif">
          Acesse: profac.com.br
        </text>
        
        <!-- Linha decorativa inferior -->
        <rect x="25" y="280" width="370" height="2" fill="url(#borderGradient)"/>
        
        <!-- Elementos decorativos minimalistas -->
        <circle cx="50" cy="50" r="8" fill="none" stroke="#cbd5e1" stroke-width="1" opacity="0.5"/>
        <circle cx="370" cy="50" r="8" fill="none" stroke="#cbd5e1" stroke-width="1" opacity="0.5"/>
        <rect x="45" y="275" width="16" height="2" fill="#cbd5e1" opacity="0.7"/>
        <rect x="359" y="275" width="16" height="2" fill="#cbd5e1" opacity="0.7"/>
      </svg>
    `;
  };
  
  const generateSVGInvite = () => {
    return style === 'modern' ? generateModernInvite() : generateFormalInvite();
  };
  
  const handleSVGGenerate = () => {
    const svgContent = generateSVGInvite();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `convite-profac-${style}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onGenerate('svg');
  };
  
  const handleJPGGenerate = () => {
    const svgContent = generateSVGInvite();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // A4 landscape 70% em alta resolução
    canvas.width = 420 * 2; // 2x para qualidade
    canvas.height = 297 * 2;
    
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `convite-profac-${style}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
          }
        }, 'image/jpeg', 0.95);
      }
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
    onGenerate('jpg');
  };
  
  return (
    <div className="space-y-4">
      {/* Seletor de estilo */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Escolha o estilo do convite:</Label>
        <RadioGroup 
          value={style} 
          onValueChange={(value: 'modern' | 'formal') => setStyle(value)}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="modern" id="modern" />
            <Label htmlFor="modern" className="cursor-pointer">Moderno (Futurista)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="formal" id="formal" />
            <Label htmlFor="formal" className="cursor-pointer">Formal (Tradicional)</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Botões de geração */}
      <div className="flex gap-3">
        <Button
          onClick={handleSVGGenerate}
          variant="outline"
          className="bg-purple-600 hover:bg-purple-700 text-white border-none"
        >
          📄 Gerar SVG
        </Button>
        <Button
          onClick={handleJPGGenerate}
          variant="outline"
          className="bg-green-600 hover:bg-green-700 text-white border-none"
        >
          🖼️ Gerar JPG
        </Button>
      </div>
      
      {/* Preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-2">
          Preview - Estilo {style === 'modern' ? 'Moderno' : 'Formal'} (Landscape A4 70%)
        </h4>
        <div 
          className="border bg-white rounded shadow-sm overflow-hidden"
          style={{ width: '420px', height: '297px', transform: 'scale(0.75)', transformOrigin: 'top left' }}
          dangerouslySetInnerHTML={{ __html: generateSVGInvite() }}
        />
      </div>
    </div>
  );
};