import { validatePasswordStrength, PASSWORD_REQUIREMENTS } from "@shared/passwordValidator";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  autoHideWhenStrong?: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true,
  autoHideWhenStrong = false
}: PasswordStrengthIndicatorProps) {
  // Só esconder completamente se senha estiver vazia
  if (!password) return null;
  
  const strength = validatePasswordStrength(password);
  
  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Força da senha:</span>
          <span className={`font-medium ${strength.color}`}>
            {strength.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.score <= 1 ? 'bg-red-500' :
              strength.score <= 2 ? 'bg-orange-500' :
              strength.score <= 3 ? 'bg-yellow-500' :
              strength.score <= 4 ? 'bg-blue-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.max(10, (strength.score / 5) * 100)}%` }}
          />
        </div>
      </div>
      
      {/* Feedback - ocultar se senha for forte/muito forte e autoHide ativo */}
      {password.length > 0 && strength.feedback.length > 0 && !(autoHideWhenStrong && strength.score >= 4) && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-sm">
            <div className="space-y-1">
              {strength.feedback.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-current rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Requirements checklist - ocultar se senha for forte e autoHideWhenStrong estiver ativo */}
      {showRequirements && password.length > 0 && !(autoHideWhenStrong && strength.score >= 4) && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Requisitos da senha:
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              {password.length >= 8 ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className={password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                Mínimo de 8 caracteres
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {/[A-Z]/.test(password) ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                Pelo menos uma letra maiúscula
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {/[a-z]/.test(password) ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                Pelo menos uma letra minúscula
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {/[0-9]/.test(password) ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                Pelo menos um número
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}