import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, Download, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface DownloadTooltipProps {
  status: 'ready' | 'downloading' | 'complete' | 'error' | 'no-config';
  children: React.ReactNode;
  fileName?: string;
}

export function DownloadTooltip({ status, children, fileName }: DownloadTooltipProps) {
  const getTooltipContent = () => {
    switch (status) {
      case 'ready':
        return {
          icon: <Download className="h-4 w-4 text-blue-500" />,
          title: "Pronto para download! 🚀",
          description: "Arquivo verificado e esperando você clicar. É como um presente embrulhado, só que digital!",
          tip: "Dica: Clique e relaxe, deixamos tudo preparadinho para você."
        };
      
      case 'downloading':
        return {
          icon: <Clock className="h-4 w-4 text-yellow-500 animate-spin" />,
          title: "Download em andamento... ⏳",
          description: "Seus bits estão viajando pela internet! Imagine pequenos pacotes de dados correndo para chegar até você.",
          tip: "Patience, young Padawan. Grandes arquivos precisam de tempo para crescer."
        };
      
      case 'complete':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          title: "Sucesso total! 🎉",
          description: "Download concluído! O arquivo está na sua pasta Downloads, provavelmente fazendo amizade com outros arquivos.",
          tip: "Parabéns! Você agora possui mais 1 arquivo. Sua coleção digital cresceu!"
        };
      
      case 'error':
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          title: "Oops! Algo deu errado 😅",
          description: "O download decidiu tirar férias inesperadas. Talvez o arquivo esteja jogando esconde-esconde no servidor.",
          tip: "Não se preocupe! Até os melhores sistemas têm seus momentos dramáticos. Tente novamente!"
        };
      
      case 'no-config':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
          title: "FTP em modo invisível 👻",
          description: "As configurações FTP estão brincando de fantasma! Elas existem, mas ninguém consegue vê-las no momento.",
          tip: "Chame um administrador para fazer a configuração aparecer. É como mágica, mas com mais cliques!"
        };
      
      default:
        return {
          icon: <HelpCircle className="h-4 w-4 text-gray-500" />,
          title: "Status misterioso 🤔",
          description: "Este status está em uma dimensão paralela. Ainda não descobrimos como interpretá-lo!",
          tip: "Se você ver isso, provavelmente encontrou um bug. Parabéns, você é um beta tester involuntário!"
        };
    }
  };

  const content = getTooltipContent();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-80 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="space-y-3">
            {/* Header with icon and title */}
            <div className="flex items-center gap-2">
              {content.icon}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {content.title}
              </span>
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {content.description}
            </p>
            
            {/* File name if provided */}
            {fileName && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="px-2 py-1">
                  {fileName}
                </Badge>
              </div>
            )}
            
            {/* Tip */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                💡 {content.tip}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Status badge component with tooltip
interface DownloadStatusBadgeProps {
  status: 'ready' | 'downloading' | 'complete' | 'error' | 'no-config';
  fileName?: string;
  className?: string;
}

export function DownloadStatusBadge({ status, fileName, className = "" }: DownloadStatusBadgeProps) {
  const getBadgeProps = () => {
    switch (status) {
      case 'ready':
        return {
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          label: "Pronto"
        };
      case 'downloading':
        return {
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 animate-pulse",
          label: "Baixando..."
        };
      case 'complete':
        return {
          variant: "default" as const,
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          label: "Concluído"
        };
      case 'error':
        return {
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          label: "Erro"
        };
      case 'no-config':
        return {
          variant: "outline" as const,
          className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
          label: "Sem FTP"
        };
      default:
        return {
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          label: "Desconhecido"
        };
    }
  };

  const badgeProps = getBadgeProps();

  return (
    <DownloadTooltip status={status} fileName={fileName}>
      <Badge 
        variant={badgeProps.variant}
        className={`${badgeProps.className} ${className} cursor-help transition-all hover:scale-105`}
      >
        {badgeProps.label}
      </Badge>
    </DownloadTooltip>
  );
}