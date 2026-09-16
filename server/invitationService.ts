import { sendEmail } from "./emailService";
import { nanoid } from "nanoid";

interface InvitationEmailParams {
  email: string;
  inviteToken: string;
  senderName: string;
}

// Generate a unique invitation token
export function generateInviteToken(): string {
  return nanoid(32);
}

export async function sendInvitationEmail(params: InvitationEmailParams): Promise<boolean> {
  try {
    console.log(`📧 [INVITATION] Enviando convite para: ${params.email}`);
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite PROFAC</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 30%),
                linear-gradient(45deg, transparent 40%, rgba(16, 185, 129, 0.1) 50%, transparent 60%),
                linear-gradient(-45deg, transparent 40%, rgba(139, 92, 246, 0.1) 50%, transparent 60%),
                repeating-linear-gradient(90deg, transparent, transparent 98px, rgba(255, 255, 255, 0.03) 100px);
            line-height: 1.6;
            min-height: 100vh;
            position: relative;
        }
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 2px, transparent 2px),
                radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.08) 1px, transparent 1px),
                radial-gradient(circle at 50% 10%, rgba(139, 92, 246, 0.06) 3px, transparent 3px);
            background-size: 60px 60px, 30px 30px, 80px 80px;
            opacity: 0.4;
            z-index: -1;
        }
        .email-wrapper {
            background: transparent;
            padding: 40px 20px;
            min-height: 100vh;
            position: relative;
        }
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 
                0 25px 50px rgba(0, 0, 0, 0.3), 
                0 0 0 1px rgba(255, 255, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .tech-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 40%),
                radial-gradient(ellipse at 70% 70%, rgba(16, 185, 129, 0.12) 0%, transparent 35%),
                radial-gradient(ellipse at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 30%),
                linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 35%, transparent 70%);
            pointer-events: none;
            opacity: 0.8;
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 30%, #3730a3 70%, #581c87 100%);
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.15) 2px, transparent 2px),
                radial-gradient(circle at 85% 85%, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                radial-gradient(circle at 45% 30%, rgba(16, 185, 129, 0.2) 1px, transparent 1px),
                linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.05) 50%, transparent 52%);
            background-size: 40px 40px, 20px 20px, 60px 60px, 100px 100px;
            opacity: 0.6;
        }
        .header::after {
            content: '💰📊💳🏦📈💼🔒🤖📱💻';
            position: absolute;
            top: 10px;
            right: 20px;
            font-size: 12px;
            opacity: 0.3;
            letter-spacing: 5px;
            animation: float 20s infinite linear;
            z-index: 10;
        }
        @keyframes float {
            0% { transform: translateX(100px); }
            100% { transform: translateX(-100px); }
        }
        .header-content {
            position: relative;
            z-index: 10;
            color: white;
            padding: 50px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 36px;
            font-weight: 800;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            color: white;
            position: relative;
            z-index: 15;
        }
        .header .subtitle {
            font-size: 18px;
            opacity: 0.95;
            font-weight: 300;
            letter-spacing: 0.5px;
            color: white;
            position: relative;
            z-index: 15;
        }
        .tech-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 50px;
            padding: 8px 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 15px;
            backdrop-filter: blur(10px);
            color: white;
            position: relative;
            z-index: 15;
        }
        .content {
            position: relative;
            z-index: 2;
            padding: 50px 40px;
            background: rgba(255, 255, 255, 0.95);
        }
        .welcome-section {
            text-align: center;
            margin-bottom: 40px;
        }
        .welcome-section h2 {
            color: #1e293b;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 15px 0;
        }
        .welcome-section p {
            color: #475569;
            font-size: 16px;
            max-width: 500px;
            margin: 0 auto;
        }
        .invitation-card {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border: 1px solid #cbd5e1;
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }
        .invitation-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
        }

        .cta-section {
            text-align: center;
            margin: 50px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
            color: white;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        .cta-button:hover::before {
            left: 100%;
        }
        .steps-section {
            background: rgba(241, 245, 249, 0.5);
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
        }
        .steps-list {
            counter-reset: step-counter;
            list-style: none;
            padding: 0;
        }
        .steps-list li {
            counter-increment: step-counter;
            padding: 15px 0;
            position: relative;
            padding-left: 60px;
        }
        .steps-list li::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 15px;
            width: 35px;
            height: 35px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
        }
        .link-backup {
            background: rgba(30, 41, 59, 0.05);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        .backup-link {
            word-break: break-all;
            font-family: 'Courier New', monospace;
            background: rgba(59, 130, 246, 0.1);
            padding: 10px 15px;
            border-radius: 8px;
            color: #1e40af;
            font-size: 13px;
            margin-top: 10px;
            display: inline-block;
        }
        .footer {
            background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
            color: #e2e8f0;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }
        .footer-brand {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .footer-contact {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
        }
        .disclaimer {
            background: rgba(241, 245, 249, 0.8);
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            color: #64748b;
            font-size: 14px;
            font-style: italic;
            text-align: center;
        }
        @media (max-width: 600px) {
            .email-wrapper { padding: 20px 10px; }
            .header-content { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .header h1 { font-size: 28px; }
            .cta-button { padding: 15px 30px; font-size: 16px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="tech-overlay"></div>
            
            <div class="header">
                <div class="header-content">
                    <h1>✉️ Convidamos você para conhecer o PROFAC</h1>
                    <div class="subtitle">Sistema de Gestão para Factoring</div>
                    <div class="tech-badge">💎 Tecnologia de Ponta</div>
                </div>
            </div>
            
            <div class="content">
                <div class="welcome-section">
                    <h2 style="margin-bottom: 10px;">Olá! Você foi especialmente convidado</h2>
                    <p style="margin-bottom: 15px;">${params.senderName} convidou você para acessar o <strong>PROFAC</strong>, nosso site que visa facilitar a atualização das versões, feedback, histórico de versões e está sendo preparada uma versão web para gerenciamento totalmente desenvolvida por IA.</p>
                </div>
                
                <div class="invitation-card">
                    <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 22px;">🚀 O que você encontrará no site:</h3>
                    <p style="color: #475569; margin-bottom: 0;">Uma plataforma focada em facilitar atualizações de versões, coleta de feedback, histórico completo de versões e acesso antecipado à futura versão web de gerenciamento desenvolvida inteiramente por inteligência artificial.</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border: 1px solid #cbd5e1; border-radius: 16px; padding: 25px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 24px;">📋 Como se cadastrar:</h3>
                    <div style="background: rgba(59, 130, 246, 0.1); border-radius: 12px; padding: 20px; margin: 15px 0;">
                        <ol style="color: #475569; font-size: 16px; margin: 0; padding-left: 20px; text-align: left;">
                            <li style="margin-bottom: 8px;"><strong>Acesse:</strong> profac.com.br</li>
                            <li style="margin-bottom: 8px;"><strong>Clique em:</strong> "Cadastrar" ou "Registrar"</li>
                            <li style="margin-bottom: 8px;"><strong>Preencha:</strong> Seus dados empresariais</li>
                            <li style="margin-bottom: 0;"><strong>Aguarde:</strong> Aprovação da nossa equipe</li>
                        </ol>
                    </div>
                    <p style="color: #0f172a; font-weight: 700; font-size: 20px; margin: 15px 0 0 0;">
                        🌐 <span style="color: #2563eb;">profac.com.br</span>
                    </p>
                </div>
                
                <div class="disclaimer">
                    ⏰ <strong>Este convite é válido por 30 dias.</strong><br>
                    Se você não solicitou este convite, pode ignorar este email com segurança.
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-brand">PROFAC</div>
                <p style="margin: 5px 0;">Transformando o futuro do factoring no Brasil</p>
                <p style="margin: 20px 0 0 0;">
                    <a href="mailto:contato@profac.com.br" class="footer-contact">📧 contato@profac.com.br</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
CONVITE PROFAC - Site de Atualizações e Versões

Olá!

${params.senderName} convidou você para acessar o PROFAC, nosso site que visa facilitar a atualização das versões, feedback, histórico de versões e está sendo preparada uma versão web para gerenciamento totalmente desenvolvida por IA.

🚀 O que você encontrará no site:
- Atualizações de Versões: Facilite o processo de atualização
- Sistema de Feedback: Envie sugestões e reportes  
- Histórico de Versões: Acompanhe todas as mudanças
- Futuro Web IA: Versão de gerenciamento desenvolvida por inteligência artificial

ACESSE: profac.com.br

Próximos passos:
1. Clique no link acima
2. Complete seu cadastro com seus dados empresariais
3. Aguarde a aprovação da nossa equipe
4. Acesse as funcionalidades de versões e feedback!

Este convite é válido por 30 dias.

PROFAC - Site de Atualizações
Facilitando atualizações, feedback e histórico de versões
contato@profac.com.br
`;

    const success = await sendEmail({
      to: params.email,
      from: "contato@profac.com.br",
      subject: "Convidamos você para conhecer o PROFAC",
      html: htmlContent,
      text: textContent
    });

    if (success) {
      console.log(`✅ Convite enviado com sucesso para: ${params.email}`);
      return true;
    } else {
      console.log(`❌ Falha ao enviar convite para: ${params.email}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao enviar convite para ${params.email}:`, error);
    return false;
  }
}