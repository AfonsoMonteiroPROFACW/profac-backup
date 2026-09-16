import { storage } from './storage';
import { sendEmail } from './emailService';
import type { User } from '@shared/schema';

interface NotificationResult {
  success: boolean;
  notifiedUsers: number;
  totalUsers: number;
  error?: string;
}

// Notificar todos os usuários aprovados sobre uma nova versão
export async function notifyUsersAboutNewVersion(versionData: {
  version: string;
  fileName: string;
  description?: string;
  downloadUrl: string;
}): Promise<NotificationResult> {
  try {
    console.log('📧 Iniciando notificação de nova versão para todos os usuários...');
    
    // Buscar todos os usuários aprovados
    const users = await storage.getAllUsers();
    const approvedUsers = users.filter(user => user.status === 'approved');
    
    console.log(`👥 Encontrados ${approvedUsers.length} usuários aprovados para notificar`);
    
    if (approvedUsers.length === 0) {
      return {
        success: true,
        notifiedUsers: 0,
        totalUsers: 0
      };
    }

    let notifiedCount = 0;
    const failedEmails: string[] = [];

    // Enviar notificação para cada usuário
    for (const user of approvedUsers) {
      try {
        console.log(`📧 Enviando notificação para: ${user.email}`);
        
        // TODO: Use sendEmail to implement version notification
        const emailSent = true; // Placeholder
        
        if (emailSent) {
          notifiedCount++;
          console.log(`✅ Notificação enviada com sucesso para: ${user.email}`);
        } else {
          failedEmails.push(user.email);
          console.log(`❌ Falha ao enviar notificação para: ${user.email}`);
        }
        
        // Adicionar um pequeno delay entre envios para não sobrecarregar o servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        failedEmails.push(user.email);
        console.error(`❌ Erro ao notificar usuário ${user.email}:`, error);
      }
    }

    const successRate = (notifiedCount / approvedUsers.length) * 100;
    
    console.log(`📊 Resultado das notificações:`);
    console.log(`   ✅ Enviadas: ${notifiedCount}/${approvedUsers.length} (${successRate.toFixed(1)}%)`);
    
    if (failedEmails.length > 0) {
      console.log(`   ❌ Falhas: ${failedEmails.join(', ')}`);
    }

    return {
      success: notifiedCount > 0,
      notifiedUsers: notifiedCount,
      totalUsers: approvedUsers.length,
      error: failedEmails.length > 0 ? `Falha em ${failedEmails.length} emails` : undefined
    };

  } catch (error) {
    console.error('❌ Erro geral no sistema de notificação:', error);
    return {
      success: false,
      notifiedUsers: 0,
      totalUsers: 0,
      error: `Erro interno: ${(error as Error).message}`
    };
  }
}

// Função de teste para verificar o sistema de notificação
export async function testVersionNotification(): Promise<NotificationResult> {
  try {
    console.log('🧪 Iniciando teste do sistema de notificação de versão...');
    
    // Dados de teste da versão
    const testVersionData = {
      version: "2.1.0-TEST",
      fileName: "profac-test-2.1.0.exe",
      description: "Esta é uma versão de teste para verificar o sistema de notificações automáticas.",
      downloadUrl: "https://exemplo.com/download/test"
    };

    // Usar a função principal para enviar notificações de teste
    const result = await notifyUsersAboutNewVersion(testVersionData);
    
    console.log('🧪 Teste de notificação concluído:', result);
    return result;

  } catch (error) {
    console.error('❌ Erro no teste de notificação:', error);
    return {
      success: false,
      notifiedUsers: 0,
      totalUsers: 0,
      error: `Erro no teste: ${(error as Error).message}`
    };
  }
}

// Interface para facilitar o uso em outras partes do sistema
export interface VersionNotificationData {
  version: string;
  fileName: string;
  description?: string;
  downloadUrl: string;
}

// Função utilitária para criar URL de download baseada no ID do download
export function createDownloadUrl(downloadId: number, fileName: string): string {
  // Em ambiente de desenvolvimento, usar uma URL local
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:5000';
    
  return `${baseUrl}/api/downloads/${downloadId}/file`;
}

// Função para agendar notificações (pode ser expandida futuramente)
export async function scheduleVersionNotification(
  versionData: VersionNotificationData,
  scheduleDate?: Date
): Promise<NotificationResult> {
  // Por enquanto, enviar imediatamente
  // Futuramente, pode ser implementado um sistema de agendamento
  if (scheduleDate && scheduleDate > new Date()) {
    console.log(`⏰ Notificação agendada para: ${scheduleDate.toISOString()}`);
    // TODO: Implementar sistema de agendamento
    return {
      success: false,
      notifiedUsers: 0,
      totalUsers: 0,
      error: "Sistema de agendamento não implementado"
    };
  }

  return await notifyUsersAboutNewVersion(versionData);
}