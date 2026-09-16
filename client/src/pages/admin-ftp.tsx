import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Home, TestTube2, Save, Server, Activity, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

import type { FtpConfig, InsertFtpConfig } from "@shared/schema";
import { PasswordInput } from "@/components/password-input";

export default function AdminFtp() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<InsertFtpConfig>({
    ftpHost: "",
    ftpPort: 21,
    ftpUser: "",
    ftpPassword: "",
    ftpSecure: false,
    downloadPath: "/uploads",
    fileName: "setup.exe",
    isActive: true,
  });

  const { data: ftpConfig, isLoading } = useQuery<FtpConfig | null>({
    queryKey: ["/api/admin/ftp-config"],
  });

  // Health monitoring queries
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/admin/ftp-health", ftpConfig?.id],
    enabled: !!ftpConfig?.id,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: healthHistory } = useQuery({
    queryKey: ["/api/admin/ftp-health", ftpConfig?.id, "history"],
    enabled: !!ftpConfig?.id,
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  const forceHealthCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/admin/ftp-health/${ftpConfig?.id}/check`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Check manual executado",
        description: "Verificação de saúde FTP realizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ftp-health"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao executar verificação manual",
        variant: "destructive",
      });
    },
  });

  // Update form data when ftpConfig changes
  useEffect(() => {
    if (ftpConfig) {
      setFormData({
        ftpHost: ftpConfig.ftpHost,
        ftpPort: ftpConfig.ftpPort || 21,
        ftpUser: ftpConfig.ftpUser,
        ftpPassword: ftpConfig.ftpPassword || "", // Load actual password for admin visibility
        ftpSecure: ftpConfig.ftpSecure || false,
        downloadPath: ftpConfig.downloadPath,
        fileName: ftpConfig.fileName,
        isActive: ftpConfig.isActive || false,
      });
    }
  }, [ftpConfig]);

  const testConnectionMutation = useMutation({
    mutationFn: async (config: InsertFtpConfig) => {
      const response = await apiRequest("POST", "/api/admin/ftp-config/test", config);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        const connectionInfo = data.connectionTime ? ` (${data.connectionTime}ms)` : '';
        const fileInfo = data.fileExists ? ` Arquivo encontrado: ${formData.fileName}` : '';
        
        toast({
          title: data.status === 'warning' ? "Conexão com aviso" : "Conexão bem-sucedida",
          description: `${data.message}${connectionInfo}${fileInfo}`,
          variant: data.status === 'warning' ? "default" : "default",
        });

        // Show recommendations if any
        if (data.recommendations && data.recommendations.length > 0) {
          setTimeout(() => {
            toast({
              title: "Recomendações",
              description: data.recommendations.join('; '),
              variant: "default",
            });
          }, 2000);
        }
      } else {
        let errorMessage = data.message;
        if (data.issues && data.issues.length > 0) {
          errorMessage += `\n\nProblemas: ${data.issues.join(', ')}`;
        }
        
        toast({
          title: "Erro na conexão FTP",
          description: errorMessage,
          variant: "destructive",
        });

        // Show recommendations for fixing the error
        if (data.recommendations && data.recommendations.length > 0) {
          setTimeout(() => {
            toast({
              title: "Como resolver",
              description: data.recommendations.join('; '),
              variant: "default",
            });
          }, 3000);
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro interno",
        description: error.message || "Erro ao testar conexão FTP",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (config: InsertFtpConfig) => {
      const url = ftpConfig?.id ? `/api/admin/ftp-config/${ftpConfig.id}` : "/api/admin/ftp-config";
      const method = ftpConfig ? "PUT" : "POST";
      
      // Always send the complete config (including password if provided)
      const configToSend = { ...config };
      
      const response = await apiRequest(method, url, configToSend);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Configuração salva",
        description: "Configuração FTP atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ftp-config"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro ao salvar configuração FTP",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof InsertFtpConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = () => {
    if (!formData.ftpHost || !formData.ftpUser || !formData.ftpPassword) {
      toast({
        title: "Dados incompletos",
        description: "Preencha pelo menos Host, Usuário e Senha para testar a conexão",
        variant: "destructive",
      });
      return;
    }
    testConnectionMutation.mutate(formData);
  };

  const handleSave = () => {
    if (!formData.ftpHost || !formData.ftpUser || !formData.ftpPassword) {
      toast({
        title: "Dados incompletos",
        description: "Host, Usuário e Senha são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando configurações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Server className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuração FTP</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Configure o servidor FTP para gerenciar downloads de arquivos
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col gap-3 ml-8">
            <Button
              onClick={() => setLocation("/admin")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 rounded-lg font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Painel
            </Button>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 rounded-lg font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Menu Principal
            </Button>
          </div>
        </div>

        

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="space-y-6">
            {/* Conexão FTP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ftpHost">Servidor FTP *</Label>
                <Input
                  id="ftpHost"
                  value={formData.ftpHost}
                  onChange={(e) => handleInputChange("ftpHost", e.target.value)}
                  placeholder="ftp.servidor.com.br"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ftpPort">Porta</Label>
                <Input
                  id="ftpPort"
                  type="number"
                  value={formData.ftpPort || ""}
                  onChange={(e) => handleInputChange("ftpPort", parseInt(e.target.value))}
                  placeholder="21"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ftpUser">Usuário *</Label>
                <Input
                  id="ftpUser"
                  value={formData.ftpUser}
                  onChange={(e) => handleInputChange("ftpUser", e.target.value)}
                  placeholder="usuario_ftp"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ftpPassword">Senha *</Label>
                <PasswordInput
                  value={formData.ftpPassword}
                  onChange={(value) => handleInputChange("ftpPassword", value)}
                  placeholder="Digite a senha FTP"
                  name="ftpPassword"
                />
              </div>
            </div>

            {/* Configuração do Arquivo */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="downloadPath">Caminho do Arquivo *</Label>
                  <Input
                    id="downloadPath"
                    value={formData.downloadPath}
                    onChange={(e) => handleInputChange("downloadPath", e.target.value)}
                    placeholder="/uploads"
                  />
                  <p className="text-xs text-muted-foreground">
                    Caminho onde o arquivo está localizado no servidor FTP
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fileName">Nome do Arquivo *</Label>
                  <Input
                    id="fileName"
                    value={formData.fileName}
                    onChange={(e) => handleInputChange("fileName", e.target.value)}
                    placeholder="setup.exe"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome do arquivo a ser baixado
                  </p>
                </div>
              </div>
            </div>

            {/* Opções Avançadas */}
            <div className="border-t pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ftpSecure"
                    checked={formData.ftpSecure || false}
                    onCheckedChange={(checked) => handleInputChange("ftpSecure", checked)}
                  />
                  <Label htmlFor="ftpSecure">Usar FTPS (FTP Seguro)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive || false}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Configuração Ativa</Label>
                </div>
              </div>
            </div>

            {/* Test Results Display */}
            {(testConnectionMutation.data || testConnectionMutation.error || testConnectionMutation.isPending) && (
              <div className="border-t pt-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Resultado do Teste de Conexão
                  </h4>
                  
                  {testConnectionMutation.isPending && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-700 dark:text-blue-300">Testando conexão FTP...</span>
                    </div>
                  )}
                  
                  {testConnectionMutation.data && (
                    <div className={`p-4 rounded-lg ${
                      testConnectionMutation.data.success 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          testConnectionMutation.data.success ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {testConnectionMutation.data.success ? '✓' : '✗'}
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-medium ${
                            testConnectionMutation.data.success 
                              ? 'text-green-800 dark:text-green-200' 
                              : 'text-red-800 dark:text-red-200'
                          }`}>
                            {testConnectionMutation.data.success ? 'Conexão bem-sucedida' : 'Falha na conexão'}
                          </h5>
                          <p className={`mt-1 text-sm ${
                            testConnectionMutation.data.success 
                              ? 'text-green-700 dark:text-green-300' 
                              : 'text-red-700 dark:text-red-300'
                          }`}>
                            {testConnectionMutation.data.message}
                          </p>
                          
                          {testConnectionMutation.data.connectionTime && (
                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              Tempo de conexão: {testConnectionMutation.data.connectionTime}ms
                            </p>
                          )}
                          
                          {testConnectionMutation.data.fileExists !== undefined && (
                            <p className={`mt-1 text-xs ${
                              testConnectionMutation.data.fileExists 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-orange-600 dark:text-orange-400'
                            }`}>
                              Arquivo '{formData.fileName}': {testConnectionMutation.data.fileExists ? 'Encontrado ✓' : 'Não encontrado ⚠️'}
                            </p>
                          )}
                          
                          {testConnectionMutation.data.recommendations && testConnectionMutation.data.recommendations.length > 0 && (
                            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                              <h6 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Recomendações:</h6>
                              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                                {testConnectionMutation.data.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {testConnectionMutation.data.serverInfo?.version && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Servidor: {testConnectionMutation.data.serverInfo.version}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                onClick={handleTestConnection}
                disabled={testConnectionMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                <TestTube2 className="h-4 w-4 mr-2" />
                {testConnectionMutation.isPending ? "Testando..." : "Testar Conexão"}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}