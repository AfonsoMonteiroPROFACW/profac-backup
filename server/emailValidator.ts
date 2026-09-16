import nodemailer from 'nodemailer';
import { storage } from './storage';

export async function validateEmailSetup(): Promise<{ isValid: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  try {
    const emailConfig = await storage.getEmailConfig();
    if (!emailConfig) {
      issues.push('Configuração de email não encontrada');
      return { isValid: false, issues };
    }

    // Teste 1: Verificar conectividade SMTP
    console.log('🔍 Testando conectividade SMTP...');
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost as string,
      port: emailConfig.smtpPort as number,
      secure: emailConfig.smtpSecure as boolean,
      auth: {
        user: emailConfig.smtpUser as string,
        pass: emailConfig.smtpPassword as string,
      },
    });

    try {
      await transporter.verify();
      console.log('✅ Conectividade SMTP OK');
    } catch (error: any) {
      issues.push(`Falha na conectividade SMTP: ${error.message}`);
      console.log('❌ Falha na conectividade SMTP');
    }

    // Teste 2: Verificar SPF records
    console.log('🔍 Verificando registros SPF...');
    // Simulação - em produção usaria DNS lookup real
    const domain = emailConfig.fromEmail?.split('@')[1];
    if (domain) {
      console.log(`📧 Domínio de envio: ${domain}`);
      // Se não é o mesmo domínio do servidor SMTP, pode ter problemas SPF
      const smtpDomain = emailConfig.smtpHost as string;
      if (!smtpDomain.includes(domain)) {
        issues.push(`Possível problema SPF: Servidor SMTP (${smtpDomain}) não pertence ao domínio (${domain})`);
      }
    }

    return { isValid: issues.length === 0, issues };
    
  } catch (error: any) {
    issues.push(`Erro na validação: ${error.message}`);
    return { isValid: false, issues };
  }
}

export async function sendTestEmail(toEmail: string): Promise<{ success: boolean; details: string }> {
  console.log('\n🔍 === TESTE DE EMAIL INICIADO ===');
  console.log(`📧 Destinatário: ${toEmail}`);
  
  try {
    const emailConfig = await storage.getEmailConfig();
    if (!emailConfig) {
      const errorMsg = 'Configuração de email não encontrada no banco de dados';
      console.log(`❌ ${errorMsg}`);
      return { success: false, details: errorMsg };
    }

    console.log('📋 Configuração atual:');
    console.log(`   Host: ${emailConfig.smtpHost}`);
    console.log(`   Porta: ${emailConfig.smtpPort}`);
    console.log(`   Usuário: ${emailConfig.smtpUser}`);
    console.log(`   Seguro: ${emailConfig.smtpSecure}`);
    console.log(`   De: ${emailConfig.fromEmail}`);

    // Teste múltiplas configurações para máxima compatibilidade
    const configs = [
      {
        name: 'Configuração Padrão',
        settings: {
          host: emailConfig.smtpHost as string,
          port: emailConfig.smtpPort as number,
          secure: emailConfig.smtpSecure as boolean,
          auth: {
            user: emailConfig.smtpUser as string,
            pass: emailConfig.smtpPassword as string,
          }
        }
      },
      {
        name: 'STARTTLS Forçado',
        settings: {
          host: emailConfig.smtpHost as string,
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: emailConfig.smtpUser as string,
            pass: emailConfig.smtpPassword as string,
          },
          tls: {
            rejectUnauthorized: false
          }
        }
      },
      {
        name: 'SSL/TLS Forçado',
        settings: {
          host: emailConfig.smtpHost as string,
          port: 465,
          secure: true,
          auth: {
            user: emailConfig.smtpUser as string,
            pass: emailConfig.smtpPassword as string,
          }
        }
      }
    ];

    for (const config of configs) {
      console.log(`\n🔄 Tentando: ${config.name}`);
      
      try {
        const transporter = nodemailer.createTransport(config.settings as any);
        
        // Primeiro, verificar a conexão
        console.log('   🔗 Verificando conexão...');
        await transporter.verify();
        console.log('   ✅ Conexão verificada');

        // Tentar enviar o email
        console.log('   📤 Enviando email...');
        const result = await transporter.sendMail({
          from: `"PROFAC Sistema" <${emailConfig.fromEmail}>`,
          to: toEmail,
          subject: `TESTE PROFAC - ${config.name} - ${new Date().toLocaleString('pt-BR')}`,
          text: `Este é um email de teste usando ${config.name}.\nHorário: ${new Date().toLocaleString('pt-BR')}\nSe você recebeu este email, a configuração está funcionando!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #2563eb; margin-bottom: 16px;">✅ TESTE DE EMAIL PROFAC</h2>
              <p style="margin-bottom: 12px;"><strong>Configuração:</strong> ${config.name}</p>
              <p style="margin-bottom: 12px;"><strong>Horário do teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p style="margin-bottom: 12px;">Se você recebeu este email, a configuração está funcionando corretamente!</p>
              <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; margin-top: 16px;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                  <strong>Detalhes técnicos:</strong><br>
                  Host: ${emailConfig.smtpHost}<br>
                  Porta: ${config.settings.port}<br>
                  Segurança: ${config.settings.secure ? 'SSL/TLS' : (config.settings.requireTLS ? 'STARTTLS' : 'Nenhuma')}
                </p>
              </div>
            </div>
          `,
          headers: {
            'X-Mailer': 'PROFAC-Test',
            'Reply-To': emailConfig.fromEmail,
            'Return-Path': emailConfig.fromEmail,
            'Message-ID': `<test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@profac.com.br>`
          }
        });

        const successMsg = `✅ EMAIL ENVIADO COM SUCESSO!\n\n` +
          `📋 Configuração utilizada: ${config.name}\n` +
          `🆔 Message ID: ${result.messageId}\n` +
          `📧 Destinatário: ${toEmail}\n` +
          `⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n\n` +
          `🔧 Detalhes técnicos:\n` +
          `   • Host: ${emailConfig.smtpHost}\n` +
          `   • Porta: ${config.settings.port}\n` +
          `   • Segurança: ${config.settings.secure ? 'SSL/TLS' : (config.settings.requireTLS ? 'STARTTLS' : 'Nenhuma')}\n` +
          `   • Usuário: ${emailConfig.smtpUser}`;

        console.log('   ✅ Email enviado com sucesso!');
        console.log(`   🆔 Message ID: ${result.messageId}`);
        console.log('\n=== TESTE CONCLUÍDO COM SUCESSO ===\n');
        
        return { success: true, details: successMsg };

      } catch (configError: any) {
        console.log(`   ❌ Falha: ${configError.message}`);
        
        // Se é a última configuração, retornar o erro
        if (config === configs[configs.length - 1]) {
          const errorMsg = `❌ FALHA EM TODAS AS CONFIGURAÇÕES\n\n` +
            `📧 Destinatário: ${toEmail}\n` +
            `⏰ Tentativa em: ${new Date().toLocaleString('pt-BR')}\n\n` +
            `🔧 Configurações testadas:\n` +
            configs.map((c, i) => `   ${i + 1}. ${c.name} - FALHOU`).join('\n') + '\n\n' +
            `❌ Último erro: ${configError.message}\n\n` +
            `💡 Sugestões:\n` +
            `   • Verifique se as credenciais estão corretas\n` +
            `   • Confirme se o servidor SMTP está acessível\n` +
            `   • Verifique configurações de firewall\n` +
            `   • Teste a configuração em outro sistema para comparação`;

          console.log('\n❌ === TESTE FALHOU EM TODAS AS CONFIGURAÇÕES ===\n');
          return { success: false, details: errorMsg };
        }
      }
    }

    return { success: false, details: 'Erro inesperado no teste' };

  } catch (error: any) {
    const errorMsg = `❌ ERRO GERAL NO TESTE\n\n` +
      `📧 Destinatário: ${toEmail}\n` +
      `⏰ Tentativa em: ${new Date().toLocaleString('pt-BR')}\n` +
      `❌ Erro: ${error.message}\n\n` +
      `💡 Este erro indica um problema na configuração geral do sistema de email.`;

    console.log(`❌ Erro geral: ${error.message}`);
    console.log('\n=== TESTE FINALIZADO COM ERRO ===\n');
    
    return { success: false, details: errorMsg };
  }
}