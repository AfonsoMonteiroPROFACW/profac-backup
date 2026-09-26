import nodemailer from 'nodemailer';
import { storage } from './storage';
import { getBaseUrl } from './config';

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

// Detecta se o destinatário é Gmail e otimiza a configuração
function isGmailAddress(email: string): boolean {
  return email.toLowerCase().includes('@gmail.com') || email.toLowerCase().includes('@googlemail.com');
}

// Configurações otimizadas para Gmail
function getGmailOptimizedConfigs(emailConfig: any) {
  return [
    {
      name: 'Gmail Otimizada - STARTTLS',
      config: {
        host: emailConfig.smtpHost as string,
        port: 587,
        secure: false,
        requireTLS: true,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        pool: false, // Não usar pool para evitar timeouts
        maxConnections: 1,
        auth: {
          user: emailConfig.smtpUser as string,
          pass: emailConfig.smtpPassword as string,
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'TLSv1.2'
        },
        debug: false
      }
    },
    {
      name: 'Gmail Alternativa - SSL',
      config: {
        host: emailConfig.smtpHost as string,
        port: 465,
        secure: true,
        connectionTimeout: 8000,
        greetingTimeout: 5000,
        socketTimeout: 8000,
        pool: false,
        maxConnections: 1,
        auth: {
          user: emailConfig.smtpUser as string,
          pass: emailConfig.smtpPassword as string,
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    }
  ];
}

// Função para testar diferentes configurações SMTP
async function testEmailDelivery(params: EmailParams, emailConfig: any): Promise<boolean> {
  console.log('🧪 Testando configurações SMTP otimizadas...');
  
  const isGmail = isGmailAddress(params.to);
  
  // Use configurações otimizadas para Gmail
  const configurations = isGmail ? 
    getGmailOptimizedConfigs(emailConfig) : [
    {
      name: 'Configuração Padrão',
      config: {
        host: emailConfig.smtpHost as string,
        port: emailConfig.smtpPort as number,
        secure: emailConfig.smtpSecure as boolean,
        connectionTimeout: 5000,
        greetingTimeout: 3000,
        socketTimeout: 5000,
        auth: {
          user: emailConfig.smtpUser as string,
          pass: emailConfig.smtpPassword as string,
        }
      }
    },
    {
      name: 'STARTTLS Forçado',
      config: {
        host: emailConfig.smtpHost as string,
        port: 587,
        secure: false,
        requireTLS: true,
        connectionTimeout: 5000,
        auth: {
          user: emailConfig.smtpUser as string,
          pass: emailConfig.smtpPassword as string,
        },
        tls: { rejectUnauthorized: false }
      }
    }
  ];

  if (isGmail) {
    console.log('📧 Gmail detectado - usando configurações otimizadas');
  }

  for (const { name, config } of configurations) {
    try {
      console.log(`📤 Tentando: ${name}`);
      const startTime = Date.now();
      
      const transporter = nodemailer.createTransport(config as any);
      
      // Configurações de email otimizadas para Gmail
      const mailOptions: any = {
        from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
        to: params.to,
        subject: params.subject,
        text: params.text || '',
        html: params.html || '',
        headers: {
          'X-Priority': '3',
          'X-Mailer': 'PROFAC System v1.0',
          'Message-ID': `<${Date.now()}.${Math.random().toString(36)}@profac.com.br>`
        }
      };

      // Headers adicionais para Gmail
      if (isGmail) {
        mailOptions.headers['Return-Path'] = emailConfig.fromEmail;
        mailOptions.headers['Reply-To'] = emailConfig.fromEmail;
        mailOptions.headers['X-Original-To'] = params.to;
        mailOptions.headers['List-Unsubscribe'] = '<mailto:contato@profac.com.br>';
      }

      const info = await transporter.sendMail(mailOptions);

      const deliveryTime = Date.now() - startTime;
      console.log(`✅ ${name} - Sucesso! Message ID: ${info.messageId} (${deliveryTime}ms)`);
      
      // Fechar transporter para Gmail
      if (isGmail) {
        transporter.close();
      }
      
      return true;
      
    } catch (error: any) {
      console.log(`❌ ${name} - Falhou: ${error.message}`);
      continue;
    }
  }
  
  return false;
}

// Função de diagnóstico específico para Gmail
async function diagnoseGmailIssues(email: string, emailConfig: any): Promise<string[]> {
  const issues: string[] = [];
  
  // Verificações específicas para Gmail
  if (isGmailAddress(email)) {
    // Verificar se está usando App Password
    if (emailConfig.smtpPassword && emailConfig.smtpPassword.length < 16) {
      issues.push('Gmail pode requerer uma "Senha de App" em vez da senha normal da conta');
    }
    
    // Verificar configuração SMTP para Gmail
    if (emailConfig.smtpHost !== 'smtp.gmail.com' && emailConfig.smtpHost !== 'relay.dynu.com') {
      issues.push('Para Gmail, considere usar smtp.gmail.com ou seu relay atual (relay.dynu.com)');
    }
    
    // Verificar porta
    if (emailConfig.smtpPort !== 587 && emailConfig.smtpPort !== 465) {
      issues.push('Gmail funciona melhor com porta 587 (STARTTLS) ou 465 (SSL)');
    }
  }
  
  return issues;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Get email configuration from database
    const emailConfig = await storage.getEmailConfig();
    
    if (!emailConfig || !emailConfig.isActive) {
      console.error('❌ Configuração de email não encontrada ou inativa');
      return false;
    }

    const isGmail = isGmailAddress(params.to);
    if (isGmail) {
      console.log(`📧 [GMAIL] Processando email para Gmail: ${params.to}`);
      
      // Executar diagnóstico específico para Gmail
      const gmailIssues = await diagnoseGmailIssues(params.to, emailConfig);
      if (gmailIssues.length > 0) {
        console.log('⚠️ [GMAIL] Possíveis problemas detectados:');
        gmailIssues.forEach(issue => console.log(`   • ${issue}`));
      }
    } else {
      console.log(`📧 [EMAIL SERVICE] Tentando entrega para: ${params.to}`);
    }
    
    // Tentar entrega usando configurações otimizadas
    const startTime = Date.now();
    const success = await testEmailDelivery(params, emailConfig);
    const totalTime = Date.now() - startTime;
    
    if (success) {
      if (isGmail) {
        console.log(`✅ [GMAIL] Email entregue com sucesso em ${totalTime}ms para: ${params.to}`);
      } else {
        console.log(`✅ Email entregue com sucesso em ${totalTime}ms para: ${params.to}`);
      }
      return true;
    } else {
      if (isGmail) {
        console.log(`❌ [GMAIL] Falha na entrega após ${totalTime}ms para: ${params.to}`);
        console.log('💡 [GMAIL] Sugestões: Verifique senha de app, 2FA, e permissões da conta Gmail');
      } else {
        console.log(`❌ Falha em todas as configurações SMTP para: ${params.to}`);
      }
      return false;
    }
    
  } catch (error: any) {
    console.error('❌ Erro geral no sistema de email:', error.message);
    return false;
  }
}

export async function sendPasswordResetEmail(
  userEmail: string, 
  userName: string, 
  temporaryPassword: string
): Promise<boolean> {
  // Get email configuration to use proper from address
  const emailConfig = await storage.getEmailConfig();
  const fromEmail = emailConfig?.fromEmail || 'noreply@profac.com.br';
  
  const emailParams: EmailParams = {
    to: userEmail,
    from: fromEmail,
    subject: 'PROFAC - Nova Senha Temporária',
    text: `
Olá ${userName},

Você solicitou uma nova senha para o sistema PROFAC.

Sua senha temporária é: ${temporaryPassword}

IMPORTANTE:
- Esta senha é temporária e deve ser alterada no seu próximo login
- Por segurança, você será solicitado a criar uma nova senha assim que acessar o sistema
- Esta senha temporária expira em 24 horas

Para acessar o sistema, visite: ${getBaseUrl()}/auth

Se você não solicitou esta alteração, entre em contato conosco imediatamente.

Atenciosamente,
Equipe PROFAC
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e40af; margin: 0; font-size: 28px;">PROFAC</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">Sistema de Gestão para Factoring</p>
    </div>
    
    <h2 style="color: #374151; margin-bottom: 20px;">Nova Senha Temporária</h2>
    
    <p style="color: #374151; line-height: 1.6;">Olá <strong>${userName}</strong>,</p>
    
    <p style="color: #374151; line-height: 1.6;">
      Você solicitou uma nova senha para o sistema PROFAC.
    </p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #374151; font-weight: bold;">Sua senha temporária é:</p>
      <div style="font-family: monospace; font-size: 24px; font-weight: bold; color: #1e40af; background-color: white; padding: 15px; border-radius: 6px; border: 2px dashed #1e40af;">
        ${temporaryPassword}
      </div>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">⚠️ IMPORTANTE:</h3>
      <ul style="color: #92400e; margin: 0; padding-left: 20px;">
        <li>Esta senha é temporária e deve ser alterada no seu próximo login</li>
        <li>Por segurança, você será solicitado a criar uma nova senha assim que acessar o sistema</li>
        <li>Esta senha temporária expira em 24 horas</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${getBaseUrl()}/auth" 
         style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Acessar Sistema
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      Se você não solicitou esta alteração, entre em contato conosco imediatamente.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <div style="text-align: center;">
      <p style="color: #6b7280; margin: 0; font-size: 14px;">
        Atenciosamente,<br>
        <strong>Equipe PROFAC</strong>
      </p>
    </div>
  </div>
</div>
    `
  };

  return await sendEmail(emailParams);
}