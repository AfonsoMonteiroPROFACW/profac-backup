import { FtpValidator } from './ftpValidator';
import { storage } from './storage';
import type { FtpConfig } from '@shared/schema';

interface HealthCheckResult {
  timestamp: Date;
  configId: number;
  status: 'healthy' | 'warning' | 'critical';
  success: boolean;
  connectionTime?: number;
  fileExists?: boolean;
  issues: string[];
  lastCheck: Date;
}

export class FtpHealthMonitor {
  private static instance: FtpHealthMonitor;
  private healthHistory: Map<number, HealthCheckResult[]> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly maxHistorySize = 50; // Keep last 50 health checks per config
  private readonly checkIntervalMs = 5 * 60 * 1000; // Check every 5 minutes
  
  private constructor() {}
  
  static getInstance(): FtpHealthMonitor {
    if (!FtpHealthMonitor.instance) {
      FtpHealthMonitor.instance = new FtpHealthMonitor();
    }
    return FtpHealthMonitor.instance;
  }
  
  /**
   * Start automated health monitoring
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    console.log('🔍 Iniciando monitoramento automático de FTP...');
    
    // Run initial check
    this.performHealthCheck().catch(error => {
      console.error('Erro no check inicial de FTP:', error);
    });
    
    // Schedule periodic checks
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck().catch(error => {
        console.error('Erro no check periódico de FTP:', error);
      });
    }, this.checkIntervalMs);
  }
  
  /**
   * Stop automated health monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️ Monitoramento automático de FTP interrompido');
    }
  }
  
  /**
   * Perform health check on active FTP configuration
   */
  async performHealthCheck(): Promise<HealthCheckResult | null> {
    try {
      const ftpConfig = await storage.getFtpConfig();
      
      if (!ftpConfig || !ftpConfig.isActive) {
        if (process.env.NODE_ENV === 'development') {
          console.log('ℹ️ Nenhuma configuração FTP ativa encontrada');
        }
        return null;
      }
      
      const validator = new FtpValidator();
      const validationResult = await validator.validateAndTest(ftpConfig);
      
      const healthResult: HealthCheckResult = {
        timestamp: new Date(),
        configId: ftpConfig.id,
        status: this.determineHealthStatus(validationResult),
        success: validationResult.success,
        connectionTime: validationResult.connectionTime,
        fileExists: validationResult.fileExists,
        issues: validationResult.issues || [],
        lastCheck: new Date()
      };
      
      // Store health result
      this.storeHealthResult(ftpConfig.id, healthResult);
      
      // Log health status
      this.logHealthStatus(healthResult, ftpConfig);
      
      return healthResult;
      
    } catch (error) {
      console.error('❌ Erro durante health check de FTP:', error);
      return null;
    }
  }
  
  /**
   * Validate configuration when it changes
   */
  async validateConfigurationChange(config: FtpConfig): Promise<HealthCheckResult> {
    console.log('🔧 Validando alteração na configuração FTP...');
    
    const validator = new FtpValidator();
    const validationResult = await validator.validateAndTest(config);
    
    const healthResult: HealthCheckResult = {
      timestamp: new Date(),
      configId: config.id,
      status: this.determineHealthStatus(validationResult),
      success: validationResult.success,
      connectionTime: validationResult.connectionTime,
      fileExists: validationResult.fileExists,
      issues: validationResult.issues || [],
      lastCheck: new Date()
    };
    
    this.storeHealthResult(config.id, healthResult);
    this.logHealthStatus(healthResult, config);
    
    return healthResult;
  }
  
  /**
   * Get health history for a configuration
   */
  getHealthHistory(configId: number): HealthCheckResult[] {
    return this.healthHistory.get(configId) || [];
  }
  
  /**
   * Get current health status
   */
  getCurrentHealthStatus(configId: number): HealthCheckResult | null {
    const history = this.healthHistory.get(configId);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }
  
  /**
   * Get health statistics
   */
  getHealthStatistics(configId: number): {
    totalChecks: number;
    successRate: number;
    averageConnectionTime: number;
    lastSuccessfulCheck?: Date;
    lastFailedCheck?: Date;
    consecutiveFailures: number;
  } {
    const history = this.healthHistory.get(configId) || [];
    
    if (history.length === 0) {
      return {
        totalChecks: 0,
        successRate: 0,
        averageConnectionTime: 0,
        consecutiveFailures: 0
      };
    }
    
    const successful = history.filter(h => h.success);
    const failed = history.filter(h => !h.success);
    const connectionTimes = history.filter(h => h.connectionTime).map(h => h.connectionTime!);
    
    // Count consecutive failures from the end
    let consecutiveFailures = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (!history[i].success) {
        consecutiveFailures++;
      } else {
        break;
      }
    }
    
    return {
      totalChecks: history.length,
      successRate: (successful.length / history.length) * 100,
      averageConnectionTime: connectionTimes.length > 0 
        ? connectionTimes.reduce((a, b) => a + b, 0) / connectionTimes.length 
        : 0,
      lastSuccessfulCheck: successful.length > 0 ? successful[successful.length - 1].timestamp : undefined,
      lastFailedCheck: failed.length > 0 ? failed[failed.length - 1].timestamp : undefined,
      consecutiveFailures
    };
  }
  
  /**
   * Check if FTP is currently experiencing issues
   */
  isExperiencingIssues(configId: number): boolean {
    const stats = this.getHealthStatistics(configId);
    return stats.consecutiveFailures >= 3 || stats.successRate < 70;
  }
  
  /**
   * Generate health report
   */
  generateHealthReport(configId: number): {
    status: 'healthy' | 'warning' | 'critical';
    summary: string;
    details: any;
    recommendations: string[];
  } {
    const currentHealth = this.getCurrentHealthStatus(configId);
    const stats = this.getHealthStatistics(configId);
    const isExperiencingIssues = this.isExperiencingIssues(configId);
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    let summary = 'Configuração FTP funcionando normalmente';
    let recommendations: string[] = [];
    
    if (isExperiencingIssues) {
      status = 'critical';
      summary = `Sistema FTP com problemas críticos (${stats.consecutiveFailures} falhas consecutivas)`;
      recommendations.push('Verifique a conectividade de rede');
      recommendations.push('Confirme se as credenciais estão corretas');
      recommendations.push('Teste a configuração manualmente');
    } else if (stats.successRate < 90) {
      status = 'warning';
      summary = `Sistema FTP com instabilidade (${stats.successRate.toFixed(1)}% de sucesso)`;
      recommendations.push('Monitore a estabilidade da conexão');
      recommendations.push('Considere ajustar timeouts');
    } else if (stats.averageConnectionTime > 5000) {
      status = 'warning';
      summary = `Conexão FTP lenta (média: ${stats.averageConnectionTime.toFixed(0)}ms)`;
      recommendations.push('Verifique a latência da rede');
      recommendations.push('Considere otimizar a configuração');
    }
    
    return {
      status,
      summary,
      details: {
        currentHealth,
        statistics: stats,
        isExperiencingIssues
      },
      recommendations
    };
  }
  
  private determineHealthStatus(validationResult: any): 'healthy' | 'warning' | 'critical' {
    if (!validationResult.success) {
      return 'critical';
    }
    
    if (validationResult.status === 'warning' || !validationResult.fileExists) {
      return 'warning';
    }
    
    if (validationResult.connectionTime && validationResult.connectionTime > 10000) {
      return 'warning'; // Slow connection
    }
    
    return 'healthy';
  }
  
  private storeHealthResult(configId: number, result: HealthCheckResult): void {
    if (!this.healthHistory.has(configId)) {
      this.healthHistory.set(configId, []);
    }
    
    const history = this.healthHistory.get(configId)!;
    history.push(result);
    
    // Keep only the most recent results
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize);
    }
  }
  
  private logHealthStatus(result: HealthCheckResult, config: FtpConfig): void {
    const statusEmoji = {
      healthy: '✅',
      warning: '⚠️',
      critical: '❌'
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${statusEmoji[result.status]} FTP Health Check - ${config.ftpHost}:${config.ftpPort} - ` +
        `${result.success ? 'Sucesso' : 'Falha'}` +
        (result.connectionTime ? ` (${result.connectionTime}ms)` : '') +
        (result.fileExists !== undefined ? ` - Arquivo: ${result.fileExists ? 'OK' : 'Não encontrado'}` : '')
      );
      
      if (result.issues.length > 0) {
        console.log(`  Issues: ${result.issues.join(', ')}`);
      }
    }
    
    // Log critical issues in production too
    if (result.status === 'critical') {
      console.error(`❌ FTP Critical Issue - ${config.ftpHost}: ${result.issues.join(', ')}`);
    }
  }
}