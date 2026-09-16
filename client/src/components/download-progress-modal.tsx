import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, AlertCircle, X, FileDown, Gauge, Activity, Clock, HardDrive, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DownloadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: number;
  status: 'downloading' | 'processing' | 'complete' | 'error';
  fileName?: string;
  message: string;
  fileSize?: string;
  downloadSpeed?: string;
  timeRemaining?: string;
  downloadUrl?: string;
}

export function DownloadProgressModal({
  isOpen,
  onClose,
  progress,
  status,
  fileName,
  message,
  fileSize,
  downloadSpeed,
  timeRemaining,
  downloadUrl
}: DownloadProgressModalProps) {
  const { toast } = useToast();
  
  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'processing':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const formatFileSize = (size: string | undefined) => {
    if (!size) return '';
    return size.includes('MB') || size.includes('KB') || size.includes('GB') ? size : `${size} MB`;
  };

  // Função para criar gauge circular animado
  const renderGauge = () => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return (
      <div className="relative w-36 h-36 mx-auto">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle with smooth animation */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-75 ease-out",
              status === 'complete' ? "text-green-500" : 
              status === 'error' ? "text-red-500" : 
              status === 'processing' ? "text-orange-500" :
              "text-blue-500"
            )}
            strokeLinecap="round"
            style={{
              filter: status !== 'complete' && status !== 'error' ? 'drop-shadow(0 0 6px currentColor)' : 'none'
            }}
          />
          
          {/* Animated glow effect for active downloads */}
          {(status === 'downloading' || status === 'processing') && (
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="text-blue-300 opacity-50 animate-pulse"
              strokeLinecap="round"
            />
          )}
        </svg>
        
        {/* Center text with improved typography */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={cn("text-3xl font-bold transition-colors duration-200", getStatusColor())}>
              {progress.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {status === 'complete' ? 'Completo' : 
               status === 'error' ? 'Erro' : 
               status === 'processing' ? 'Processando' :
               'Baixando'}
            </div>
          </div>
        </div>
        
        {/* Pulse animation for active downloads */}
        {(status === 'downloading' || status === 'processing') && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-300 opacity-30 animate-ping"></div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Gauge className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold">
              Download Manager
            </span>
          </DialogTitle>
          <DialogDescription>
            {fileName ? `Baixando ${fileName}` : 'Preparando download do arquivo'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Gauge Principal */}
          <div className="text-center">
            {renderGauge()}
          </div>

          {/* Dados de Transmissão com animações */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className={cn(
                    "h-4 w-4 text-blue-600 transition-all duration-200",
                    (status === 'downloading' || status === 'processing') && "animate-pulse"
                  )} />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Velocidade</span>
                </div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-200 font-mono">
                  {downloadSpeed || '0.0 MB/s'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Restante</span>
                </div>
                <div className="text-lg font-bold text-green-800 dark:text-green-200 font-mono">
                  {timeRemaining || 'Calculando...'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Progresso</span>
                </div>
                <div className="text-lg font-bold text-purple-800 dark:text-purple-200 font-mono">
                  {fileSize || '8.3 MB'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className={cn(
                    "h-4 w-4 text-orange-600 transition-all duration-200",
                    (status === 'downloading' || status === 'processing') && "animate-bounce"
                  )} />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Status</span>
                </div>
                <div className="text-lg font-bold text-orange-800 dark:text-orange-200">
                  {status === 'complete' ? 'Completo' : 
                   status === 'error' ? 'Erro' : 
                   status === 'processing' ? 'Processando' : 'Ativo'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar Linear com animação suave */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Progresso</span>
              <span className={cn("font-bold transition-colors duration-200", getStatusColor())}>
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progress} 
                className="h-4 transition-all duration-75 ease-out"
              />
              {/* Animated shine effect */}
              {(status === 'downloading' || status === 'processing') && (
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          </div>

          {/* Status Message com animação */}
          <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border transition-all duration-300">
            <div className={cn(
              "text-sm font-medium transition-colors duration-200",
              getStatusColor()
            )}>
              {message}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {status === 'complete' && (
              <Button 
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Concluído
              </Button>
            )}
            
            {status === 'error' && (
              <Button 
                onClick={onClose}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Fechar
              </Button>
            )}
            
            {(status === 'downloading' || status === 'processing') && (
              <Button 
                onClick={onClose}
                variant="outline"
                size="sm"
              >
                Ocultar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}