import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download as DownloadIcon, CheckCircle, FileText, Zap, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadProgressModal } from "@/components/download-progress-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/authUtils";
import type { Download as DownloadType } from "@shared/schema";

function VersionHistoryCard() {
  const { data: versionHistory } = useQuery({
    queryKey: ["/api/version-history"],
  });

  const currentHistory = Array.isArray(versionHistory) ? versionHistory[0] : null;

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          Histórico de Versões
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Acompanhe as novidades e melhorias da versão atual
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {currentHistory ? (
          <pre className="whitespace-pre-wrap text-sm bg-white dark:bg-gray-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700 text-gray-800 dark:text-gray-200 font-mono leading-relaxed h-64 overflow-y-auto">
            {currentHistory?.content || "Nenhum histórico de versões disponível."}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-400">
            <p>Nenhum histórico de versões disponível.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DownloadsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [progressModal, setProgressModal] = useState({
    isOpen: false,
    progress: 0,
    status: 'downloading' as 'downloading' | 'processing' | 'complete' | 'error',
    fileName: '',
    message: '',
    fileSize: '',
    downloadSpeed: '',
    timeRemaining: ''
  });

  const { data: downloads = [], isLoading } = useQuery<DownloadType[]>({
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
      
      setProgressModal({
        isOpen: true,
        progress: 0,
        status: 'error',
        fileName: errorTitle,
        message: errorMessage,
        fileSize: '',
        downloadSpeed: '',
        timeRemaining: ''
      });
    },
  });

  const getDownloadIcon = (download: DownloadType) => {
    if (download.isBeta) return Zap;
    if (download.fileName.includes("Manual")) return FileText;
    return CheckCircle;
  };

  const getDownloadBadge = (download: DownloadType) => {
    if (download.isBeta) return { label: "Beta", variant: "destructive" as const };
    if (download.fileName.includes("Manual")) return { label: "Manual", variant: "outline" as const };
    return { label: "Estável", variant: "default" as const };
  };

  const handleDownload = (download: DownloadType) => {
    if (!isAuthenticated) {
      setProgressModal({
        isOpen: true,
        progress: 0,
        status: 'error',
        fileName: 'Acesso Restrito',
        message: 'Somente usuários autenticados podem realizar downloads.\n\nFaça login para acessar esta funcionalidade.',
        fileSize: '',
        downloadSpeed: '',
        timeRemaining: ''
      });
      return;
    }
    
    // Primeiro validar arquivo, só depois mostrar progresso
    setProgressModal({
      isOpen: true,
      progress: 0,
      status: 'downloading',
      fileName: download.fileName,
      message: 'Verificando disponibilidade...',
      fileSize: download.fileSize || '15.2 MB',
      downloadSpeed: '',
      timeRemaining: ''
    });

    // Executar validação primeiro
    downloadMutation.mutate(download.id, {
      onSuccess: (data) => {
        // Se validação passou, mostrar progresso
        simulateDownloadProgress(download, data);
      }
    });
  };

  const simulateDownloadProgress = (download: DownloadType, downloadData: any) => {
    let progress = 0;
    let phase = 'connecting'; // connecting, downloading, processing, finalizing
    let speed = 0;
    let targetSpeed = 0;
    let bytesDownloaded = 0;
    const totalBytes = 8.3 * 1024 * 1024; // 8.3 MB em bytes
    
    const updateInterval = 50; // Update every 50ms for smooth animation
    
    const interval = setInterval(() => {
      // Realistic download phases
      if (progress < 5) {
        phase = 'connecting';
        targetSpeed = 0.1;
        progress += 0.5;
      } else if (progress < 15) {
        phase = 'initializing';
        targetSpeed = 1.2;
        progress += Math.random() * 1.5 + 0.5;
      } else if (progress < 85) {
        phase = 'downloading';
        // Variable speed simulation - faster in middle, slower at start/end
        const speedMultiplier = Math.sin((progress - 15) / 70 * Math.PI) * 0.8 + 0.2;
        targetSpeed = 2.5 + speedMultiplier * 2.0;
        progress += Math.random() * 2 + 1;
      } else if (progress < 95) {
        phase = 'processing';
        targetSpeed = Math.max(0.5, targetSpeed * 0.9);
        progress += Math.random() * 0.8 + 0.2;
      } else if (progress < 100) {
        phase = 'finalizing';
        targetSpeed = Math.max(0.1, targetSpeed * 0.8);
        progress += Math.random() * 0.5 + 0.1;
      }

      // Smooth speed transition
      speed = speed + (targetSpeed - speed) * 0.1;
      bytesDownloaded = (progress / 100) * totalBytes;

      if (progress >= 100) {
        progress = 100;
        speed = 0;
        bytesDownloaded = totalBytes;
        
        setProgressModal(prev => ({
          ...prev,
          progress: 100,
          status: 'complete',
          message: `Download de ${download.fileName} concluído!\n\nO arquivo está sendo transferido para seu computador.`,
          downloadSpeed: '0.0 MB/s',
          timeRemaining: 'Concluído',
          fileSize: `${(totalBytes / 1024 / 1024).toFixed(1)} MB`
        }));
        clearInterval(interval);

        // Start actual download after short delay
        setTimeout(() => {
          if (downloadData.downloadUrl) {
            console.log("Iniciando download real...");
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = downloadData.downloadUrl;
            document.body.appendChild(iframe);
            
            setTimeout(() => {
              try {
                document.body.removeChild(iframe);
              } catch (e) {
                // Ignore if already removed
              }
            }, 5000);
          }
          
          // Keep modal open longer to show completion
          setTimeout(() => {
            setProgressModal(prev => ({ ...prev, isOpen: false }));
          }, 4000);
        }, 2000);
      } else {
        // Calculate remaining time
        const remainingBytes = totalBytes - bytesDownloaded;
        const timeLeftSeconds = speed > 0 ? remainingBytes / (speed * 1024 * 1024) : 999;
        
        const getPhaseMessage = () => {
          switch (phase) {
            case 'connecting': return 'Conectando ao servidor...';
            case 'initializing': return 'Iniciando transferência...';
            case 'downloading': return 'Baixando arquivo...';
            case 'processing': return 'Processando dados...';
            case 'finalizing': return 'Finalizando download...';
            default: return 'Baixando...';
          }
        };

        const formatTime = (seconds: number) => {
          if (seconds > 60) return `${Math.round(seconds / 60)}m`;
          return `${Math.round(seconds)}s`;
        };

        setProgressModal(prev => ({
          ...prev,
          progress: Math.round(progress * 10) / 10, // Round to 1 decimal
          status: phase === 'processing' || phase === 'finalizing' ? 'processing' : 'downloading',
          message: getPhaseMessage(),
          downloadSpeed: `${speed.toFixed(1)} MB/s`,
          timeRemaining: timeLeftSeconds < 999 ? formatTime(timeLeftSeconds) : 'Calculando...',
          fileSize: `${(bytesDownloaded / 1024 / 1024).toFixed(1)} / ${(totalBytes / 1024 / 1024).toFixed(1)} MB`
        }));
      }
    }, updateInterval);
  };

  return (
    <section id="downloads" className="py-12 md:py-20 bg-gray-50 dark:bg-gray-800 pb-20 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
            Downloads
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto px-2">
            Baixe a versão mais recente do sistema e mantenha-se atualizado com as últimas funcionalidades
          </p>
        </div>

        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(210,79%,46%)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando downloads...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Download Card - Apenas versão mais recente */}
            <Card className="lg:w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <DownloadIcon className="h-5 w-5 text-[hsl(210,79%,46%)]" />
                  Download
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Versão mais recente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {downloads.length > 0 ? (() => {
                  const download = downloads[0]; // Apenas a primeira versão
                  const Icon = getDownloadIcon(download);
                  const badge = getDownloadBadge(download);
                  
                  return (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
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
                        <div className="flex justify-between">
                          <span>Tamanho:</span>
                          <span className="font-medium">{download.fileSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lançamento:</span>
                          <span className="font-medium">{formatDate(download.releaseDate)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {download.description}
                      </p>

                      <Button
                        onClick={() => handleDownload(download)}
                        disabled={downloadMutation.isPending}
                        className="w-full bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,40%)] text-white transition-colors duration-200"
                      >
                        {downloadMutation.isPending ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Validando...</span>
                          </div>
                        ) : !isAuthenticated ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Restrito
                          </>
                        ) : (
                          <>
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Baixar
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })() : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <DownloadIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum download disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Version History - ocupando o restante da área */}
            <div className="lg:flex-1">
              {isAuthenticated && <VersionHistoryCard />}
            </div>
          </div>
        )}

        {/* Mostrar todas as versões apenas se não autenticado */}
        {!isAuthenticated && downloads.length > 0 && (
          <div className="mt-8 grid gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {downloads.map((download) => {
              const Icon = getDownloadIcon(download);
              const badge = getDownloadBadge(download);
              
              return (
                <Card key={download.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            Versão {download.version}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                              {download.fileName}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={badge.variant}>
                          {badge.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Tamanho:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{download.fileSize}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Data:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{formatDate(download.releaseDate)}</p>
                        </div>
                      </div>

                      {download.description && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Descrição:</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {download.description}
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={() => handleDownload(download)}
                        disabled={downloadMutation.isPending}
                        className="w-full bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,40%)] text-white transition-colors duration-200"
                      >
                        {downloadMutation.isPending ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Validando...</span>
                          </div>
                        ) : !isAuthenticated ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Restrito
                          </>
                        ) : (
                          <>
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Baixar
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
            })}
          </div>
        )}

        {/* Progress Modal */}
        <DownloadProgressModal
          isOpen={progressModal.isOpen}
          progress={progressModal.progress}
          status={progressModal.status}
          fileName={progressModal.fileName}
          message={progressModal.message}
          fileSize={progressModal.fileSize}
          downloadSpeed={progressModal.downloadSpeed}
          timeRemaining={progressModal.timeRemaining}
          onClose={() => setProgressModal(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </section>
  );
}