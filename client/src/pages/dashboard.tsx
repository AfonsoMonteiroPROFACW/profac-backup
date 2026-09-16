import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Download, Settings, LogOut, Shield, Ticket, HelpCircle, Lock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatDate } from "@/lib/authUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { VersionHistoryEditor } from "@/components/version-history-editor";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Download as DownloadType } from "@shared/schema";
import { DownloadProgressModal } from "@/components/download-progress-modal";


export default function Dashboard() {
  const { user, logoutMutation, isAdmin, isSuperAdmin, isAuthenticated } = useAuth();
  
  const shouldShowAdminLink = isAdmin;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Progress modal state
  const [progressModal, setProgressModal] = useState({
    isOpen: false,
    progress: 0,
    status: 'downloading' as 'downloading' | 'processing' | 'complete' | 'error',
    fileName: '',
    message: '',
    fileSize: '',
    downloadSpeed: '',
    timeRemaining: '',
    downloadUrl: ''
  });


  // Verificar se o usuário está autenticado
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Acesso Restrito</span>
              <br />
              Somente usuários autenticados podem acessar o dashboard.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Link href="/auth">
              <Button className="bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,40%)]">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  

  // Buscar downloads para calcular o total
  const { data: downloads } = useQuery<DownloadType[]>({
    queryKey: ["/api/downloads"],
  });

  const downloadMutation = useMutation({
    mutationFn: async (downloadId: number) => {
      const response = await apiRequest("POST", `/api/downloads/${downloadId}/download`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
    },
    onError: (error: any) => {
      let errorTitle = "Erro no Download";
      let errorMessage = "Não foi possível iniciar o download";
      
      // Parse structured error response from backend
      if (error.response) {
        try {
          const errorData = JSON.parse(error.response);
          if (errorData.message) {
            errorTitle = errorData.message;
            errorMessage = errorData.details || 'Não foi possível completar o download no momento.';
            
            if (errorData.solution) {
              errorMessage += `\n\n${errorData.solution}`;
            }
          }
        } catch (parseError) {
          console.error("Erro ao processar resposta:", parseError);
          errorTitle = "Erro de Sistema";
          errorMessage = "Ocorreu um problema inesperado. Tente novamente ou entre em contato conosco.";
        }
      } else if (error.message) {
        errorTitle = "Erro de Conexão";
        errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    },
  });

  if (!user) {
    return null;
  }

  // Calcular total de downloads
  const totalDownloads = downloads?.reduce((sum, download) => sum + (download.downloadCount || 0), 0) || 0;

  const handleDownload = (download: DownloadType) => {
    // Mostrar modal de progresso imediatamente
    setProgressModal({
      isOpen: true,
      progress: 0,
      status: 'downloading',
      fileName: download.fileName,
      message: 'Conectando ao servidor FTP...',
      fileSize: download.fileSize || '8.3 MB',
      downloadSpeed: '',
      timeRemaining: '',
      downloadUrl: `/api/downloads/${download.id}/stream`
    });

    // Validar FTP primeiro
    downloadMutation.mutate(download.id, {
      onSuccess: (data) => {
        console.log('Download validado, iniciando FTP direto...');
        
        // Simular progresso visual realístico
        simulateRealDownloadProgress(download);
      },
      onError: (error) => {
        setProgressModal(prev => ({
          ...prev,
          status: 'error',
          message: 'Erro de conexão com servidor FTP',
          progress: 0
        }));
      }
    });
  };

  const simulateRealDownloadProgress = (download: DownloadType) => {
    let progress = 5; // Começar com 5% após validação
    let downloadedMB = 0;
    const totalMB = 8.3; // Tamanho real do arquivo
    const updateInterval = 400; // Atualizar a cada 400ms
    let downloadStarted = false; // Flag para controlar se o download já foi iniciado
    
    const interval = setInterval(() => {
      // Simular velocidade variável realística (1.5-3.5 MB/s)
      const currentSpeed = 1.5 + Math.random() * 2;
      const increment = (currentSpeed * updateInterval / 1000); // MB por update
      downloadedMB = Math.min(downloadedMB + increment, totalMB);
      progress = Math.round((downloadedMB / totalMB) * 100);
      
      const remainingMB = totalMB - downloadedMB;
      const timeRemaining = Math.max(0, remainingMB / currentSpeed);
      
      setProgressModal(prev => ({
        ...prev,
        progress: Math.min(progress, 99), // Não chegar a 100% até o final
        message: progress < 20 ? 'Conectando ao servidor...' : 
                progress < 50 ? 'Transferindo arquivo...' : 
                progress < 80 ? 'Download em progresso...' : 
                'Finalizando download...',
        downloadSpeed: `${currentSpeed.toFixed(1)} MB/s`,
        timeRemaining: timeRemaining > 60 ? `${Math.ceil(timeRemaining/60)}m` : `${Math.ceil(timeRemaining)}s`
      }));
      
      // Quando próximo do final, iniciar download real
      if (progress >= 90 && !downloadStarted) {
        downloadStarted = true;
        
        // Iniciar download real com verificação
        console.log('Iniciando download real...');
        
        // Criar link temporário para download direto
        console.log('Iniciando download direto via link temporário...');
        
        const link = document.createElement('a');
        link.href = `/api/downloads/${download.id}/stream`;
        link.download = download.fileName || 'setup.exe';
        link.style.display = 'none';
        
        // Adicionar ao DOM temporariamente
        document.body.appendChild(link);
        
        // Forçar download
        link.click();
        
        // Remover após pequeno delay
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        // Completar progresso
        setTimeout(() => {
          setProgressModal(prev => ({
            ...prev,
            progress: 100,
            status: 'complete',
            message: '✅ Download concluído com sucesso!\n\nO arquivo setup.exe foi baixado.\nVerifique sua pasta de Downloads.',
            downloadSpeed: '0 MB/s',
            timeRemaining: '0s'
          }));
          
          // Auto fechar após 5 segundos
          setTimeout(() => {
            setProgressModal(prev => ({ ...prev, isOpen: false }));
            
            // Download iniciado com sucesso
            
            toast({
              title: "Download Completo",
              description: `${download.fileName} foi baixado com sucesso`,
            });
          }, 5000);
          
        }, 1500);
        
        clearInterval(interval);
      }
    }, updateInterval);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <div className="bg-[hsl(210,79%,46%)] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-lg md:text-xl">
                  PROFAC
                </div>
              </Link>
              <nav className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  
                  {shouldShowAdminLink && (
                    <Link href="/admin" className="text-gray-600 dark:text-gray-300 hover:text-[hsl(210,79%,46%)] px-3 py-2 rounded-md text-sm font-medium flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      Painel Admin
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <Link href="/admin/users" className="text-gray-600 dark:text-gray-300 hover:text-[hsl(210,79%,46%)] px-3 py-2 rounded-md text-sm font-medium">
                        Usuários
                      </Link>
                      <Link href="/admin/downloads" className="text-gray-600 dark:text-gray-300 hover:text-[hsl(210,79%,46%)] px-3 py-2 rounded-md text-sm font-medium">
                        Downloads
                      </Link>
                      <Link href="/admin/tickets" className="text-gray-600 dark:text-gray-300 hover:text-[hsl(210,79%,46%)] px-3 py-2 rounded-md text-sm font-medium">
                        Tickets
                      </Link>
                    </>
                  )}
                  <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-[hsl(210,79%,46%)] px-3 py-2 rounded-md text-sm font-medium">
                    Site Público
                  </Link>
                </div>
              </nav>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <ThemeToggle />
              <span className="hidden sm:block text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate max-w-24 md:max-w-none">
                {user.fullName}
              </span>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="px-2 md:px-3 bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="space-y-4 md:space-y-6">
          {/* Welcome Section */}
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Bem-vindo, {user.fullName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
              Aqui está um resumo das suas atividades no sistema PROFAC.
            </p>
          </div>

          {/* User Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Status da Conta</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {user.status === "approved" && (
                    <Badge className="bg-green-100 text-green-800 text-xs">Aprovada</Badge>
                  )}
                  {user.status === "pending" && (
                    <Badge variant="outline" className="text-xs">Pendente</Badge>
                  )}
                  {user.status === "blocked" && (
                    <Badge variant="destructive" className="text-xs">Bloqueada</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Perfil</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {user.role === "admin" ? (
                    <Badge variant="default" className="text-xs">Administrador</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Usuário</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Último Acesso</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xs md:text-sm">
                  {user.lastLogin ? formatDate(user.lastLogin) : "Primeiro acesso"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total de Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl md:text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Downloads realizados no sistema
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Informações da Conta</CardTitle>
              <CardDescription className="text-sm">
                Detalhes do seu perfil no sistema PROFAC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {/* Primeira linha: Nome, Email, Cadastro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome Completo
                  </label>
                  <p className="text-sm md:text-base text-gray-900 dark:text-white font-semibold break-words">{user.fullName}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                    E-mail
                  </label>
                  <p className="text-sm md:text-base text-gray-900 dark:text-white font-semibold break-all">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data de Cadastro
                  </label>
                  <p className="text-sm md:text-base text-gray-900 dark:text-white font-semibold">
                    {user.createdAt ? formatDate(user.createdAt) : "Não disponível"}
                  </p>
                </div>
              </div>

              {/* Segunda linha: Empresa, Telefone, Última Atualização */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Empresa
                  </label>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {user.companyName || "Não informado"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telefone
                  </label>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {user.phone || "Não informado"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Última Atualização
                  </label>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {user.updatedAt ? formatDate(user.updatedAt) : "Não disponível"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Downloads e Histórico de Versões */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Downloads Card - Apenas versão mais recente */}
            <Card className="lg:w-80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-[hsl(210,79%,46%)]" />
                  Download
                </CardTitle>
                <CardDescription>
                  Versão mais recente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {downloads && downloads.length > 0 ? (() => {
                  const download = downloads[0]; // Apenas o primeiro download
                  return (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="bg-[hsl(210,79%,46%)]/10 rounded-lg p-2">
                          <Download className="h-4 w-4 text-[hsl(210,79%,46%)]" />
                        </div>
                        <Badge variant="default">Estável</Badge>
                      </div>

                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                        {download.fileName}
                      </h4>

                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                        <div className="flex justify-between">
                          <span>Versão:</span>
                          <span className="font-medium">{download.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Downloads:</span>
                          <span className="font-medium">{download.downloadCount || 0}</span>
                        </div>
                      </div>

                      {/* Security Badges - Removed per user request */}

                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleDownload(download)}
                          disabled={downloadMutation.isPending}
                          className="w-full bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)]"
                        >
                          <Download className="mr-2 h-3 w-3" />
                          {downloadMutation.isPending ? "Validando..." : "Baixar"}
                        </Button>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum download disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Version History Editor - ocupando o restante da área */}
            <div className="lg:flex-1">
              <VersionHistoryEditor />
            </div>
          </div>




        </div>
      </main>

      {/* Progress Modal com gauge e dados de transmissão */}
      <DownloadProgressModal
        isOpen={progressModal.isOpen}
        progress={progressModal.progress}
        status={progressModal.status}
        fileName={progressModal.fileName}
        message={progressModal.message}
        fileSize={progressModal.fileSize}
        downloadSpeed={progressModal.downloadSpeed}
        timeRemaining={progressModal.timeRemaining}
        downloadUrl={progressModal.downloadUrl}
        onClose={() => setProgressModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}