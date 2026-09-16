import { Client } from 'basic-ftp';
import type { FtpConfig } from '@shared/schema';

export class FtpService {
  private config: FtpConfig;

  constructor(config: FtpConfig) {
    this.config = config;
  }

  async downloadFile(): Promise<{ success: boolean; url?: string; error?: string }> {
    const client = new Client();
    
    try {
      // Conectar ao servidor FTP
      await client.access({
        host: this.config.ftpHost,
        port: this.config.ftpPort || 21,
        user: this.config.ftpUser,
        password: this.config.ftpPassword,
        secure: this.config.ftpSecure || false
      });

      // Verificar se o arquivo existe
      const fullPath = `${this.config.downloadPath}/${this.config.fileName}`;
      
      try {
        await client.size(fullPath);
        
        // Se chegou até aqui, o arquivo existe
        // Para simplificar, vamos retornar a URL construída com base nas configurações
        const downloadUrl = this.config.ftpSecure 
          ? `ftps://${this.config.ftpHost}:${this.config.ftpPort}${fullPath}`
          : `ftp://${this.config.ftpHost}:${this.config.ftpPort}${fullPath}`;
          
        return {
          success: true,
          url: downloadUrl
        };
      } catch (error) {
        return {
          success: false,
          error: 'Arquivo não encontrado no servidor FTP'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Erro de conexão FTP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    } finally {
      client.close();
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const client = new Client();
    
    try {
      await client.access({
        host: this.config.ftpHost,
        port: this.config.ftpPort || 21,
        user: this.config.ftpUser,
        password: this.config.ftpPassword,
        secure: this.config.ftpSecure || false
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Erro de conexão FTP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    } finally {
      client.close();
    }
  }
}