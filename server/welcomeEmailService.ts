import { sendEmail } from './emailService';

interface WelcomeEmailData {
  userEmail: string;
  userName: string;
  companyName: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  console.log(`📧 [WELCOME EMAIL] Iniciando envio para: ${data.userEmail}`);
  console.log(`📧 [WELCOME EMAIL] Dados recebidos:`, data);
  
  const { userEmail, userName, companyName } = data;

  const subject = "🎉 Bem-vindo ao PROFAC - Acesso Aprovado!";
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo ao PROFAC</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 10px; 
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #2563eb, #1d4ed8); 
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: bold;
        }
        .content { 
          padding: 30px 20px;
        }
        .welcome-box {
          background: #f8fafc;
          border-left: 4px solid #2563eb;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .features {
          background: #fafafa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .features h3 {
          color: #2563eb;
          margin-top: 0;
        }
        .features ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .features li {
          margin: 8px 0;
          color: #555;
        }
        .cta-button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .footer { 
          background: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          color: #666; 
          font-size: 14px;
          border-top: 1px solid #eee;
        }
        .highlight { 
          color: #2563eb; 
          font-weight: bold; 
        }
        .success-badge {
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          display: inline-block;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PROFAC</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Sistema de Gestão para Factoring</p>
        </div>
        
        <div class="content">
          <div class="success-badge">✅ ACESSO APROVADO</div>
          
          <h2>Olá, ${userName}!</h2>
          
          <div class="welcome-box">
            <p><strong>Parabéns!</strong> Seu acesso ao sistema PROFAC foi aprovado com sucesso.</p>
            <p>A empresa <span class="highlight">${companyName}</span> agora possui acesso completo à nossa plataforma de gestão para factoring.</p>
          </div>

          <div class="features">
            <h3>🚀 O que você pode fazer agora:</h3>
            <ul>
              <li><strong>Downloads Seguros:</strong> Acesse e baixe as versões mais recentes do software</li>
              <li><strong>Histórico de Versões:</strong> Consulte todas as atualizações e melhorias</li>
              <li><strong>Suporte Técnico:</strong> Contate nossa equipe quando precisar</li>
              <li><strong>Área do Cliente:</strong> Gerencie seus dados e configurações</li>
              <li><strong>Notificações:</strong> Receba alertas sobre novas versões</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://profac.replit.app/login" class="cta-button">
              🔐 Acessar Sistema
            </a>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>📝 Lembre-se:</strong></p>
            <p style="margin: 5px 0 0 0;">Use o email <span class="highlight">${userEmail}</span> para fazer login no sistema.</p>
          </div>

          <p>Se tiver dúvidas ou precisar de suporte, nossa equipe está sempre disponível:</p>
          <ul>
            <li><strong>Email:</strong> contato@profac.com.br</li>
            <li><strong>Sistema:</strong> Use a área de suporte dentro da plataforma</li>
          </ul>
        </div>
        
        <div class="footer">
          <p><strong>PROFAC - Sistema de Gestão para Factoring</strong></p>
          <p>Este é um email automático do sistema. Não responda diretamente.</p>
          <p style="margin-top: 15px; font-size: 12px; color: #999;">
            Enviado em ${new Date().toLocaleString('pt-BR', { 
              timeZone: 'America/Sao_Paulo',
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
PROFAC - Bem-vindo ao Sistema!

Olá, ${userName}!

ACESSO APROVADO ✅

Parabéns! Seu acesso ao sistema PROFAC foi aprovado com sucesso.
A empresa ${companyName} agora possui acesso completo à nossa plataforma.

O QUE VOCÊ PODE FAZER AGORA:
• Downloads Seguros: Acesse e baixe as versões mais recentes
• Histórico de Versões: Consulte todas as atualizações
• Suporte Técnico: Contate nossa equipe quando precisar
• Área do Cliente: Gerencie seus dados e configurações

ACESSO:
Use o email ${userEmail} para fazer login em:
https://profac.replit.app/login

SUPORTE:
• Email: contato@profac.com.br
• Sistema: Use a área de suporte dentro da plataforma

PROFAC - Sistema de Gestão para Factoring
Este é um email automático. Não responda diretamente.
  `;

  console.log(`📧 [WELCOME EMAIL] Chamando sendEmail via SMTP direto`);
  
  try {
    const success = await sendEmail({
      to: userEmail,
      from: "contato@profac.com.br",
      subject: subject,
      html: htmlContent,
      text: textContent
    });

    console.log(`📧 [WELCOME EMAIL] Resultado do sendEmail SMTP:`, success);

    if (success) {
      console.log(`✅ Email de boas-vindas SMTP enviado com sucesso para: ${userEmail}`);
      return true;
    } else {
      console.error(`❌ Falha no envio SMTP para: ${userEmail}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro crítico no SMTP para: ${userEmail}:`, error);
    return false;
  }
}