import { Client } from 'basic-ftp';
import { Readable } from 'stream';
import type { InsertFtpConfig } from '@shared/schema';

interface FtpValidationResult {
  success: boolean;
  message: string;
  details?: string;
  status: 'success' | 'warning' | 'error';
  issues?: string[];
  recommendations?: string[];
  connectionTime?: number;
  fileExists?: boolean;
  serverInfo?: {
    version?: string;
    features?: string[];
  };
}

export class FtpValidator {
  async validateAndTest(config: InsertFtpConfig): Promise<FtpValidationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let connectionTime = 0;
    let fileExists = false;
    let serverInfo: any = {};

    try {
      // Basic validation
      this.validateConfiguration(config, issues, recommendations);

      if (issues.length > 0) {
        return {
          success: false,
          message: `Configuração inválida: ${issues.join(', ')}`,
          status: 'error',
          issues,
          recommendations
        };
      }

      // Test connection
      const client = new Client();
      client.ftp.verbose = false;
      
      const startTime = Date.now();
      console.log(`🔗 Conectando ao servidor FTP: ${config.ftpHost}:${config.ftpPort}`);
      
      await client.access({
        host: config.ftpHost,
        port: config.ftpPort || 21,
        user: config.ftpUser,
        password: config.ftpPassword,
        secure: config.ftpSecure || false,
        secureOptions: config.ftpSecure ? { rejectUnauthorized: false } : undefined
      });

      connectionTime = Date.now() - startTime;
      console.log(`✅ Conexão estabelecida em ${connectionTime}ms`);

      // Get server information
      try {
        const systemInfo = await client.send('SYST');
        serverInfo.version = systemInfo.message || 'Desconhecido';
        console.log(`📊 Servidor: ${serverInfo.version}`);
      } catch (e) {
        console.log('ℹ️  Informações do servidor não disponíveis');
      }

      // Test directory navigation
      try {
        console.log(`📂 Testando acesso ao diretório: ${config.downloadPath}`);
        await client.cd(config.downloadPath);
        console.log(`✅ Acesso ao diretório confirmado`);
      } catch (e) {
        issues.push(`Diretório não acessível: ${config.downloadPath}`);
        recommendations.push(`Verifique se o diretório '${config.downloadPath}' existe e tem permissões adequadas`);
      }

      // Test file existence
      if (config.fileName) {
        try {
          console.log(`📄 Verificando arquivo: ${config.fileName}`);
          const list = await client.list();
          const file = list.find(item => item.name === config.fileName);
          
          if (file) {
            fileExists = true;
            console.log(`✅ Arquivo encontrado: ${config.fileName} (${this.formatFileSize(file.size)})`);
          } else {
            console.log(`⚠️  Arquivo não encontrado: ${config.fileName}`);
            recommendations.push(`O arquivo '${config.fileName}' não foi encontrado no diretório especificado`);
          }
        } catch (e) {
          console.log(`❌ Erro ao verificar arquivo: ${(e as Error).message}`);
          issues.push(`Erro ao verificar arquivo: ${config.fileName}`);
        }
      }

      // Test upload permissions (optional)
      try {
        console.log('🔧 Testando permissões de escrita...');
        const testContent = Buffer.from('PROFAC FTP Test File');
        const testFileName = `profac_test_${Date.now()}.tmp`;
        
        await client.uploadFrom(Readable.from(testContent), testFileName);
        await client.remove(testFileName);
        console.log('✅ Permissões de escrita confirmadas');
      } catch (e) {
        console.log('ℹ️  Permissões de escrita não disponíveis (somente leitura)');
        recommendations.push('Servidor configurado apenas para leitura');
      }

      await client.close();

      // Generate success message
      let message = `Conexão FTP estabelecida com sucesso em ${connectionTime}ms`;
      if (fileExists) {
        message += `. Arquivo '${config.fileName}' encontrado e pronto para download.`;
      } else if (config.fileName) {
        message += `. Arquivo '${config.fileName}' não encontrado no servidor.`;
      }

      return {
        success: true,
        message,
        status: fileExists ? 'success' : 'warning',
        connectionTime,
        fileExists,
        serverInfo,
        issues: issues.length > 0 ? issues : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined
      };

    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('❌ Erro na conexão FTP:', errorMessage);

      // Analyze common FTP errors
      const analysis = this.analyzeError(errorMessage);
      
      return {
        success: false,
        message: `Falha na conexão FTP: ${analysis.userMessage}`,
        details: errorMessage,
        status: 'error',
        issues: [...issues, analysis.userMessage],
        recommendations: [...recommendations, ...analysis.recommendations]
      };
    }
  }

  private validateConfiguration(config: InsertFtpConfig, issues: string[], recommendations: string[]) {
    if (!config.ftpHost || config.ftpHost.trim() === '') {
      issues.push('Host FTP é obrigatório');
      recommendations.push('Informe o endereço do servidor FTP (ex: ftp.servidor.com.br)');
    }

    if (!config.ftpUser || config.ftpUser.trim() === '') {
      issues.push('Usuário FTP é obrigatório');
      recommendations.push('Informe o nome de usuário para autenticação FTP');
    }

    if (!config.ftpPassword || config.ftpPassword.trim() === '') {
      issues.push('Senha FTP é obrigatória');
      recommendations.push('Informe a senha para autenticação FTP');
    }

    if (config.ftpPort && (config.ftpPort < 1 || config.ftpPort > 65535)) {
      issues.push('Porta FTP inválida');
      recommendations.push('Use uma porta válida entre 1 e 65535 (padrão: 21)');
    }

    if (!config.downloadPath || config.downloadPath.trim() === '') {
      issues.push('Caminho de download é obrigatório');
      recommendations.push('Informe o diretório no servidor onde estão os arquivos (ex: /uploads)');
    }

    if (!config.fileName || config.fileName.trim() === '') {
      issues.push('Nome do arquivo é obrigatório');
      recommendations.push('Informe o nome do arquivo a ser baixado (ex: setup.exe)');
    }

    // Additional validation recommendations
    if (config.ftpHost && !config.ftpHost.includes('.')) {
      recommendations.push('Verifique se o host FTP está correto (deve conter domínio)');
    }

    if (config.ftpPort === 990 && !config.ftpSecure) {
      recommendations.push('Porta 990 geralmente requer conexão segura (FTPS)');
    }

    if (config.ftpSecure && config.ftpPort === 21) {
      recommendations.push('Para FTPS, considere usar porta 990 ou 21 com STARTTLS');
    }
  }

  private analyzeError(errorMessage: string): { userMessage: string; recommendations: string[] } {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('timeout') || lowerError.includes('connect')) {
      return {
        userMessage: 'Timeout de conexão - servidor inacessível',
        recommendations: [
          'Verifique se o host FTP está correto',
          'Confirme se a porta está correta (padrão: 21)',
          'Verifique sua conexão com a internet',
          'Confirme se o servidor FTP está online'
        ]
      };
    }

    if (lowerError.includes('authentication') || lowerError.includes('login') || lowerError.includes('530')) {
      return {
        userMessage: 'Falha na autenticação - usuário ou senha incorretos',
        recommendations: [
          'Verifique se o usuário FTP está correto',
          'Confirme se a senha FTP está correta',
          'Verifique se a conta FTP está ativa no servidor'
        ]
      };
    }

    if (lowerError.includes('permission') || lowerError.includes('access') || lowerError.includes('550')) {
      return {
        userMessage: 'Sem permissão de acesso ao diretório',
        recommendations: [
          'Verifique se o caminho do diretório está correto',
          'Confirme se o usuário tem permissão de acesso ao diretório',
          'Teste com um diretório diferente'
        ]
      };
    }

    if (lowerError.includes('host') || lowerError.includes('resolve') || lowerError.includes('dns')) {
      return {
        userMessage: 'Não foi possível resolver o host FTP',
        recommendations: [
          'Verifique se o endereço do servidor está correto',
          'Confirme se o servidor FTP existe',
          'Teste a conectividade DNS'
        ]
      };
    }

    if (lowerError.includes('refused') || lowerError.includes('connection refused')) {
      return {
        userMessage: 'Conexão recusada pelo servidor',
        recommendations: [
          'Verifique se a porta FTP está correta',
          'Confirme se o serviço FTP está rodando no servidor',
          'Verifique firewall ou bloqueios de rede'
        ]
      };
    }

    if (lowerError.includes('ssl') || lowerError.includes('tls') || lowerError.includes('certificate')) {
      return {
        userMessage: 'Erro de certificado SSL/TLS',
        recommendations: [
          'Verifique se a configuração FTPS está correta',
          'Confirme se o servidor suporta conexões seguras',
          'Teste sem conexão segura temporariamente'
        ]
      };
    }

    // Generic error
    return {
      userMessage: 'Erro de conexão FTP',
      recommendations: [
        'Verifique todas as configurações FTP',
        'Confirme se o servidor está acessível',
        'Teste a conectividade de rede',
        'Contate o administrador do servidor FTP'
      ]
    };
  }

  private formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }
}