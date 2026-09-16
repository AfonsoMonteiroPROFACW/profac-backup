import { Shield, CheckCircle, Lock, Zap, FileCheck, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SecurityBadge {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  variant: "default" | "secondary" | "success" | "warning" | "info";
  priority: number;
}

const securityBadges: SecurityBadge[] = [
  {
    id: "verified-safe",
    label: "Verificado Seguro",
    icon: <Shield className="h-3 w-3" />,
    description: "Arquivo verificado contra malware e vírus. Nosso sistema faz verificações automáticas de segurança.",
    variant: "success",
    priority: 1
  },
  {
    id: "ssl-protected",
    label: "SSL Protegido",
    icon: <Lock className="h-3 w-3" />,
    description: "Download protegido por criptografia SSL/TLS. Sua conexão e download são seguros.",
    variant: "info",
    priority: 2
  },
  {
    id: "authentic-source",
    label: "Fonte Autêntica",
    icon: <CheckCircle className="h-3 w-3" />,
    description: "Download direto do servidor oficial PROFAC. Garantia de autenticidade e integridade.",
    variant: "default",
    priority: 3
  },
  {
    id: "fast-download",
    label: "Download Rápido",
    icon: <Zap className="h-3 w-3" />,
    description: "Servidor otimizado para downloads rápidos e estáveis. Velocidade média: 3.2 MB/s.",
    variant: "secondary",
    priority: 4
  },
  {
    id: "integrity-check",
    label: "Integridade Verificada",
    icon: <FileCheck className="h-3 w-3" />,
    description: "Arquivo com checksum verificado. Garantia de que o download está completo e íntegro.",
    variant: "info",
    priority: 5
  },
  {
    id: "no-malware",
    label: "Livre de Malware",
    icon: <Download className="h-3 w-3" />,
    description: "Escaneado regularmente contra malware, vírus e ameaças. 100% limpo e seguro.",
    variant: "success",
    priority: 6
  }
];

interface SecurityBadgesProps {
  selectedBadges?: string[];
  layout?: "horizontal" | "vertical" | "grid";
  size?: "sm" | "md" | "lg";
  showTooltips?: boolean;
  className?: string;
}

export function SecurityBadges({ 
  selectedBadges = ["verified-safe", "ssl-protected", "authentic-source"],
  layout = "horizontal",
  size = "sm",
  showTooltips = true,
  className 
}: SecurityBadgesProps) {
  const activeBadges = securityBadges
    .filter(badge => selectedBadges.includes(badge.id))
    .sort((a, b) => a.priority - b.priority);

  const getBadgeVariant = (variant: string) => {
    switch (variant) {
      case "success": return "default";
      case "info": return "secondary";
      case "warning": return "outline";
      default: return variant as any;
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case "vertical":
        return "flex flex-col gap-2";
      case "grid":
        return "grid grid-cols-2 gap-2";
      default:
        return "flex flex-wrap gap-2";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "lg":
        return "text-sm px-3 py-2";
      case "md":
        return "text-xs px-2 py-1";
      default:
        return "text-xs px-2 py-1";
    }
  };

  if (!showTooltips) {
    return (
      <div className={cn(getLayoutClasses(), className)}>
        {activeBadges.map((badge) => (
          <Badge
            key={badge.id}
            variant={getBadgeVariant(badge.variant)}
            className={cn(
              "flex items-center gap-1 font-medium",
              getSizeClasses(),
              badge.variant === "success" && "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
              badge.variant === "info" && "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
            )}
          >
            {badge.icon}
            {badge.label}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(getLayoutClasses(), className)}>
      {activeBadges.map((badge) => (
        <div key={badge.id} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          {badge.icon}
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}

// Pre-configured badge sets for different contexts
export const BADGE_PRESETS = {
  basic: ["verified-safe", "ssl-protected"],
  standard: ["verified-safe", "ssl-protected", "authentic-source"],
  premium: ["verified-safe", "ssl-protected", "authentic-source", "fast-download"],
  enterprise: ["verified-safe", "ssl-protected", "authentic-source", "fast-download", "integrity-check", "no-malware"],
  minimal: ["integrity-check", "no-malware"]
};

// Component for displaying a security summary
interface SecuritySummaryProps {
  preset?: keyof typeof BADGE_PRESETS;
  customBadges?: string[];
  showTitle?: boolean;
  className?: string;
}

export function SecuritySummary({ 
  preset = "standard", 
  customBadges,
  showTitle = true,
  className 
}: SecuritySummaryProps) {
  const badges = customBadges || BADGE_PRESETS[preset];
  
  return (
    <>
      {showTitle && (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
      )}
      <SecurityBadges 
        selectedBadges={badges}
        layout="grid"
        size="md"
        showTooltips={true}
        className={className}
      />
    </>
  );
}