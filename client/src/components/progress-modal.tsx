import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, AlertCircle, XCircle } from "lucide-react";

interface ProgressModalProps {
  isOpen: boolean;
  progress: number;
  status: 'downloading' | 'processing' | 'complete' | 'error';
  fileName?: string;
  message?: string;
  onClose?: () => void;
}

export function ProgressModal({ isOpen, progress, status, fileName, message, onClose }: ProgressModalProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'downloading':
      case 'processing':
        return <Download className="h-8 w-8 text-blue-500 animate-bounce" />;
      case 'complete':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Download className="h-8 w-8 text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'downloading':
        return 'Baixando arquivo...';
      case 'processing':
        return 'Processando download...';
      case 'complete':
        return 'Download concluído!';
      case 'error':
        return 'Erro no download';
      default:
        return 'Preparando download...';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'downloading':
      case 'processing':
        return 'bg-blue-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Status do Download</DialogTitle>
        <div className="flex flex-col items-center space-y-6 py-8">
          {/* Status Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800">
            {getStatusIcon()}
          </div>

          {/* Status Text */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getStatusText()}
            </h3>
            {fileName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                {fileName}
              </p>
            )}
            {message && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ease-out ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Circular Progress Gauge (for visual appeal) */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2.51 * progress} 251.2`}
                className={status === 'error' ? 'text-red-500' : 
                          status === 'complete' ? 'text-green-500' : 'text-blue-500'}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 0.3s ease'
                }}
              />
            </svg>
            {/* Progress percentage in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Loading animation for processing states */}
          {(status === 'downloading' || status === 'processing') && (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}

          {/* Error button */}
          {status === 'error' && onClose && (
            <Button 
              onClick={onClose}
              variant="destructive"
              className="mt-4"
            >
              Fechar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}