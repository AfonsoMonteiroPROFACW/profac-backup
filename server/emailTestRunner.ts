import { sendTestEmail, validateEmailSetup } from './emailValidator';
import { diagnosticEmail } from './emailDiagnostic';
import { storage } from './storage';

export interface EmailTestResults {
  success: boolean;
  message: string;
  details: string;
  timestamp: string;
  configuration: any;
  validationResults?: any;
}

export async function runCompleteEmailTest(targetEmail: string): Promise<EmailTestResults> {
  const timestamp = new Date().toLocaleString('pt-BR');
  
  console.log('\n🔍 === TESTE COMPLETO DE EMAIL INICIADO ===');
  console.log(`📧 Destinatário: ${targetEmail}`);
  console.log(`⏰ Horário: ${timestamp}`);
  
  try {
    // 1. Verificar se há configuração
    const emailConfig = await storage.getEmailConfig();
    if (!emailConfig) {
      return {
        success: false,
        message: '❌ Configuração de Email Não Encontrada',
        details: '🔧 PROBLEMA: Nenhuma configuração de email está salva no sistema.\n\n' +
          '💡 SOLUÇÃO:\n' +
          '1. Acesse o painel de administração\n' +
          '2. Vá para "Configurações de Email"\n' +
          '3. Configure os dados do servidor SMTP\n' +
          '4. Salve a configuração\n' +
          '5. Teste novamente',
        timestamp,
        configuration: null
      };
    }

    console.log('✅ Configuração encontrada');
    
    // 2. Executar validação básica
    console.log('🔍 Executando validação básica...');
    const validation = await validateEmailSetup();
    
    // 3. Executar teste de envio
    console.log('📤 Executando teste de envio...');
    const testResult = await sendTestEmail(targetEmail);
    
    if (testResult.success) {
      return {
        success: true,
        message: '✅ Email Enviado com Sucesso!',
        details: testResult.details,
        timestamp,
        configuration: {
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort,
          user: emailConfig.smtpUser,
          secure: emailConfig.smtpSecure,
          fromEmail: emailConfig.fromEmail
        },
        validationResults: validation
      };
    } else {
      return {
        success: false,
        message: '❌ Falha no Envio de Email',
        details: testResult.details,
        timestamp,
        configuration: {
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort,
          user: emailConfig.smtpUser,
          secure: emailConfig.smtpSecure,
          fromEmail: emailConfig.fromEmail
        },
        validationResults: validation
      };
    }
    
  } catch (error: any) {
    console.error('❌ Erro no teste completo:', error);
    
    return {
      success: false,
      message: '❌ Erro Técnico no Sistema',
      details: `🔧 ERRO TÉCNICO: ${error.message}\n\n` +
        '💡 POSSÍVEIS CAUSAS:\n' +
        '• Problema na conexão com o banco de dados\n' +
        '• Configuração corrompida\n' +
        '• Erro interno do servidor\n\n' +
        '🛠️ AÇÕES RECOMENDADAS:\n' +
        '1. Verifique os logs do servidor\n' +
        '2. Reconfigure o email se necessário\n' +
        '3. Reinicie o sistema se persistir\n' +
        '4. Entre em contato com o suporte técnico',
      timestamp,
      configuration: null
    };
  }
}

export async function runEmailDiagnostic(targetEmail: string): Promise<EmailTestResults> {
  const timestamp = new Date().toLocaleString('pt-BR');
  
  console.log('\n🔍 === DIAGNÓSTICO COMPLETO INICIADO ===');
  
  try {
    // Executar diagnóstico completo
    await diagnosticEmail(targetEmail);
    
    // Obter validação
    const validation = await validateEmailSetup();
    
    const emailConfig = await storage.getEmailConfig();
    
    return {
      success: true,
      message: '🔍 Diagnóstico Executado com Sucesso',
      details: `📋 DIAGNÓSTICO COMPLETO EXECUTADO\n\n` +
        `⏰ Horário: ${timestamp}\n` +
        `📧 Email testado: ${targetEmail}\n\n` +
        `🔧 Configuração atual:\n` +
        `• Host: ${emailConfig?.smtpHost || 'N/A'}\n` +
        `• Porta: ${emailConfig?.smtpPort || 'N/A'}\n` +
        `• Usuário: ${emailConfig?.smtpUser || 'N/A'}\n` +
        `• Seguro: ${emailConfig?.smtpSecure ? 'Sim' : 'Não'}\n\n` +
        `✅ Verifique os logs do servidor para detalhes completos de cada teste realizado.\n\n` +
        `${validation.isValid ? '✅ Validação: Configuração aparenta estar correta' : '⚠️ Validação: Problemas detectados'}\n\n` +
        `${validation.issues.length > 0 ? '🔍 Problemas encontrados:\n' + validation.issues.map(issue => `• ${issue}`).join('\n') : ''}`,
      timestamp,
      configuration: emailConfig ? {
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort,
        user: emailConfig.smtpUser,
        secure: emailConfig.smtpSecure,
        fromEmail: emailConfig.fromEmail
      } : null,
      validationResults: validation
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: '❌ Erro no Diagnóstico',
      details: `❌ ERRO NO DIAGNÓSTICO: ${error.message}\n\n` +
        '💡 Este erro indica um problema fundamental no sistema de email.\n\n' +
        'Verifique:\n' +
        '• Conectividade com o banco de dados\n' +
        '• Configuração salva corretamente\n' +
        '• Logs do servidor para mais detalhes',
      timestamp,
      configuration: null
    };
  }
}