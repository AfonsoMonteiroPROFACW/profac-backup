import { storage } from './storage';
import nodemailer from 'nodemailer';

export async function diagnosticEmail(targetEmail: string): Promise<void> {
  console.log('\n🔍 === DIAGNÓSTICO COMPLETO DE EMAIL ===');
  
  try {
    const emailConfig = await storage.getEmailConfig();
    if (!emailConfig) {
      console.log('❌ Nenhuma configuração de email encontrada');
      return;
    }

    console.log('📧 Configuração encontrada:');
    console.log(`   Host: ${emailConfig.smtpHost}`);
    console.log(`   Porta: ${emailConfig.smtpPort}`);
    console.log(`   Usuário: ${emailConfig.smtpUser}`);
    console.log(`   De: ${emailConfig.fromEmail}`);
    console.log(`   Nome: ${emailConfig.fromName}`);
    console.log(`   Seguro: ${emailConfig.smtpSecure}`);
    console.log(`   Ativo: ${emailConfig.isActive}`);

    // Teste 1: Conexão básica
    console.log('\n🔗 Testando conexão SMTP...');
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost as string,
      port: emailConfig.smtpPort as number,
      secure: emailConfig.smtpSecure as boolean,
      auth: {
        user: emailConfig.smtpUser as string,
        pass: emailConfig.smtpPassword as string,
      },
      debug: true,
      logger: true
    } as any);

    const verified = await transporter.verify();
    console.log(`✅ Conexão SMTP verificada: ${verified}`);

    // Teste 2: Envio com configuração básica
    console.log('\n📤 Testando envio com configuração padrão...');
    try {
      const testInfo = await transporter.sendMail({
        from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
        to: targetEmail,
        subject: 'TESTE PROFAC - Configuração Padrão',
        text: 'Este é um email de teste usando configuração padrão.',
        html: '<p>Este é um email de teste usando <strong>configuração padrão</strong>.</p>'
      });
      console.log(`✅ Envio padrão bem-sucedido: ${testInfo.messageId}`);
    } catch (standardError) {
      console.log(`❌ Falha na configuração padrão: ${standardError}`);
      
      // Teste 3: Configuração alternativa
      console.log('\n🔄 Testando configuração alternativa...');
      const altTransporter = nodemailer.createTransport({
        host: emailConfig.smtpHost as string,
        port: 587, // Força STARTTLS
        secure: false,
        requireTLS: true,
        auth: {
          user: emailConfig.smtpUser as string,
          pass: emailConfig.smtpPassword as string,
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        }
      } as any);

      try {
        const altInfo = await altTransporter.sendMail({
          from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
          to: targetEmail,
          subject: 'TESTE PROFAC - Configuração Alternativa',
          text: 'Este é um email de teste usando configuração alternativa.',
          html: '<p>Este é um email de teste usando <strong>configuração alternativa</strong>.</p>'
        });
        console.log(`✅ Envio alternativo bem-sucedido: ${altInfo.messageId}`);
      } catch (altError) {
        console.log(`❌ Falha na configuração alternativa: ${altError}`);
      }
    }

  } catch (error) {
    console.log(`❌ Erro no diagnóstico: ${error}`);
  }
  
  console.log('\n=== FIM DO DIAGNÓSTICO ===\n');
}