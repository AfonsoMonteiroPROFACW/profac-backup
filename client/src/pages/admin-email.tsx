import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Settings, TestTube, Save, ArrowLeft, Home, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertEmailConfigSchema, type EmailConfig, type InsertEmailConfig } from "@shared/schema";
import { PageTransition } from "@/components/page-transition";

import { useLocation } from "wouter";
import { PasswordInput } from "@/components/password-input";
import { EmailTester } from "@/components/EmailTester";

// Gmail-specific tester component
function GmailTester() {
  const [gmailEmail, setGmailEmail] = useState("");
  const [isTestingGmail, setIsTestingGmail] = useState(false);
  const [gmailResult, setGmailResult] = useState<any>(null);
  const { toast } = useToast();

  const testGmailDelivery = async () => {
    if (!gmailEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Digite um email @gmail.com para testar",
        variant: "destructive",
      });
      return;
    }

    if (!gmailEmail.includes('@gmail.com')) {
      toast({
        title: "Email inválido",
        description: "Este teste é específico para emails @gmail.com",
        variant: "destructive",
      });
      return;
    }

    setIsTestingGmail(true);
    setGmailResult(null);

    try {
      const response = await apiRequest("POST", "/api/admin/test-gmail-delivery", { email: gmailEmail });
      const result = await response.json();
      setGmailResult(result);
      
      if (result.success) {
        toast({
          title: "Teste Gmail concluído",
          description: "Email enviado com otimizações específicas para Gmail",
        });
      } else {
        toast({
          title: "Teste Gmail falhou",
          description: result.message || "Erro desconhecido na entrega",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Gmail test error:", error);
      
      // Parse error message properly
      let errorMessage = "Erro desconhecido";
      let details = ["Erro na comunicação com o servidor"];
      
      if (error.message) {
        if (error.message.includes("500:") || error.message.includes("Internal Server Error")) {
          errorMessage = "Erro interno do servidor";
          details = [
            "O servidor encontrou um problema interno",
            "Verifique as configurações de email",
            "Tente novamente em alguns segundos"
          ];
        } else if (error.message.includes("401:") || error.message.includes("Unauthorized")) {
          errorMessage = "Não autorizado";
          details = ["Faça login novamente", "Verifique suas permissões"];
        } else if (error.message.includes("400:") || error.message.includes("Bad Request")) {
          errorMessage = "Dados inválidos";
          details = ["Verifique se o email está correto", "Digite um email @gmail.com válido"];
        } else {
          errorMessage = error.message;
          details = [`Erro técnico: ${error.message}`];
        }
      }
      
      setGmailResult({
        success: false,
        message: errorMessage,
        details,
        recommendations: [
          "Verifique se o servidor está funcionando",
          "Confirme se você está logado como administrador",
          "Tente novamente em alguns segundos",
          "Verifique as configurações de email no sistema"
        ]
      });
      
      toast({
        title: "Erro no teste Gmail",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTestingGmail(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Teste Otimizado para Gmail
        </CardTitle>
        <CardDescription>
          Teste específico com configurações otimizadas para entrega no Gmail
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="exemplo@gmail.com"
            value={gmailEmail}
            onChange={(e) => setGmailEmail(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={testGmailDelivery}
            disabled={isTestingGmail}
            className="min-w-[120px]"
          >
            {isTestingGmail ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Testar Gmail
              </>
            )}
          </Button>
        </div>

        {gmailResult && (
          <Alert className={gmailResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-start gap-2">
              {gmailResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">
                  {gmailResult.message}
                </div>
                {gmailResult.details && (
                  <div className="text-sm space-y-1">
                    {Array.isArray(gmailResult.details) ? 
                      gmailResult.details.map((detail: string, index: number) => (
                        <div key={index} className="text-muted-foreground">• {detail}</div>
                      )) : 
                      <div className="text-muted-foreground">{gmailResult.details}</div>
                    }
                  </div>
                )}
                {gmailResult.recommendations && (
                  <div className="mt-2 text-sm">
                    <div className="font-medium text-orange-700 mb-1">Recomendações:</div>
                    {gmailResult.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="text-orange-600">• {rec}</div>
                    ))}
                  </div>
                )}
                {gmailResult.timestamp && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(gmailResult.timestamp).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <strong>Otimizações incluídas:</strong> Timeouts ajustados, headers específicos, 
          conexão STARTTLS otimizada, detecção automática de problemas de autenticação.
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminEmail() {

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: emailConfig, isLoading } = useQuery<EmailConfig>({
    queryKey: ["/api/admin/email-config"],
  });

  const form = useForm<InsertEmailConfig>({
    resolver: zodResolver(insertEmailConfigSchema),
    defaultValues: {
      smtpHost: emailConfig?.smtpHost || "",
      smtpPort: emailConfig?.smtpPort || 465,
      smtpSecure: emailConfig?.smtpSecure ?? true,
      smtpUser: emailConfig?.smtpUser || "",
      smtpPassword: emailConfig?.smtpPassword || "",
      fromEmail: emailConfig?.fromEmail || "",
      fromName: emailConfig?.fromName || "",
      isActive: emailConfig?.isActive ?? true,
    },
  });

  // Atualizar valores do formulário quando os dados carregarem
  useEffect(() => {
    if (emailConfig) {
      form.reset({
        smtpHost: emailConfig.smtpHost,
        smtpPort: emailConfig.smtpPort,
        smtpSecure: emailConfig.smtpSecure,
        smtpUser: emailConfig.smtpUser,
        smtpPassword: emailConfig.smtpPassword,
        fromEmail: emailConfig.fromEmail,
        fromName: emailConfig.fromName,
        isActive: emailConfig.isActive,
      });
    }
  }, [emailConfig, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertEmailConfig) => {
      const url = emailConfig ? `/api/admin/email-config/${emailConfig.id}` : "/api/admin/email-config";
      const method = emailConfig ? "PUT" : "POST";
      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-config"] });
      toast({
        title: "Configuração salva",
        description: "As configurações de email foram atualizadas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar configuração",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [validationResult, setValidationResult] = useState<any>(null);

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/test-email");
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Teste concluído" : "Teste falhou",
        description: data.message,
        variant: data.success ? "success" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateConfigMutation = useMutation({
    mutationFn: async (configData: InsertEmailConfig) => {
      const config = {
        host: configData.smtpHost,
        port: configData.smtpPort,
        secure: configData.smtpSecure,
        user: configData.smtpUser,
        password: configData.smtpPassword,
      };
      const res = await apiRequest("POST", "/api/admin/validate-email-config", config);
      return await res.json();
    },
    onSuccess: (data) => {
      setValidationResult(data);
      const variant = data.status === 'success' ? 'success' : 
                    data.status === 'warning' ? 'warning' : 'destructive';
      
      toast({
        title: "Validação concluída",
        description: data.message,
        variant,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na validação",
        description: error.message,
        variant: "destructive",
      });
      setValidationResult(null);
    },
  });

  const onSubmit = (data: InsertEmailConfig) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 relative">


        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuração de Email</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie as configurações do servidor de email do sistema
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

          

          {/* Configuration Form */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Servidor e Porta */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Servidor SMTP</FormLabel>
                            <FormControl>
                              <Input placeholder="mail.exemplo.com.br" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porta</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="465" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 465)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Credenciais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smtpUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuário SMTP</FormLabel>
                          <FormControl>
                            <Input placeholder="contato@exemplo.com.br" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha SMTP</FormLabel>
                          <FormControl>
                            <PasswordInput
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="********"
                              name="smtpPassword"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Informações do Remetente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email do Remetente</FormLabel>
                          <FormControl>
                            <Input placeholder="contato@exemplo.com.br" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Remetente</FormLabel>
                          <FormControl>
                            <Input placeholder="PROFAC - Sistema de Gestão" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Configurações */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smtpSecure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">SSL/TLS</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Usar conexão segura (recomendado)
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Configuração Ativa</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Usar esta configuração para envios
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="space-y-4 pt-6">
                    <Button 
                      type="submit" 
                      disabled={saveMutation.isPending}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveMutation.isPending ? "Salvando..." : "Salvar Configuração"}
                    </Button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        type="button"
                        onClick={() => validateConfigMutation.mutate(form.getValues())}
                        disabled={validateConfigMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                      >
                        {validateConfigMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Validando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Validar Configuração
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => testMutation.mutate()}
                        disabled={testMutation.isPending}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        {testMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Testando...
                          </>
                        ) : (
                          <>
                            <TestTube className="h-4 w-4 mr-2" />
                            Testar Envio
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Enhanced Email Testing */}
          <EmailTester />
          
          {/* Gmail-specific Testing */}
          <GmailTester />

          {/* Validation Results */}
          {validationResult && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validationResult.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {validationResult.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                  {validationResult.status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                  Resultado da Validação
                </CardTitle>
                <CardDescription>
                  Análise detalhada da configuração de email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Principal */}
                <Alert className={`border-l-4 ${
                  validationResult.status === 'success' ? 'border-l-green-500 bg-green-50 dark:bg-green-950' :
                  validationResult.status === 'warning' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
                  'border-l-red-500 bg-red-50 dark:bg-red-950'
                }`}>
                  <AlertDescription className={`${
                    validationResult.status === 'success' ? 'text-green-800 dark:text-green-200' :
                    validationResult.status === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                    'text-red-800 dark:text-red-200'
                  }`}>
                    <strong>{validationResult.message}</strong>
                    {validationResult.details && validationResult.details.length > 0 && (
                      <ul className="mt-2 list-disc pl-4">
                        {validationResult.details.map((detail: string, index: number) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Test Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border ${
                    validationResult.testResults.connection ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.testResults.connection ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                      <span className="font-medium">Conexão</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {validationResult.testResults.connection ? 'Conectado com sucesso' : 'Falha na conexão'}
                    </p>
                    {validationResult.performance?.connectionTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        {validationResult.performance.connectionTime}ms
                      </p>
                    )}
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    validationResult.testResults.authentication ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.testResults.authentication ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                      <span className="font-medium">Autenticação</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {validationResult.testResults.authentication ? 'Credenciais válidas' : 'Falha na autenticação'}
                    </p>
                    {validationResult.performance?.authTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        {validationResult.performance.authTime}ms
                      </p>
                    )}
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    validationResult.testResults.sendTest ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 
                    validationResult.testResults.sendTest === false ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' :
                    'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.testResults.sendTest ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        validationResult.testResults.sendTest === false ? 
                        <XCircle className="h-4 w-4 text-red-600" /> :
                        <Clock className="h-4 w-4 text-yellow-600" />
                      }
                      <span className="font-medium">Envio de Teste</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {validationResult.testResults.sendTest ? 'Email enviado' : 
                       validationResult.testResults.sendTest === false ? 'Falha no envio' : 
                       'Não testado'}
                    </p>
                    {validationResult.performance?.sendTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        {validationResult.performance.sendTime}ms
                      </p>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {validationResult.recommendations && validationResult.recommendations.length > 0 && (
                  <Alert className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950">
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      <strong>Recomendações:</strong>
                      <ul className="mt-2 list-disc pl-4">
                        {validationResult.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
}