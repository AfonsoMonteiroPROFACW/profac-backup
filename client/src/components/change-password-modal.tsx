import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { changePasswordSchema, type ChangePasswordData } from "@shared/schema";
import { PasswordInput } from "@/components/password-input";
import { validatePasswordStrength } from "@shared/passwordValidator";


interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  isPasswordReset?: boolean; // When true, don't ask for current password
}

export function ChangePasswordModal({ isOpen, onClose, userEmail, isPasswordReset = false }: ChangePasswordModalProps) {
  const { toast } = useToast();
  const [passwordStrength, setPasswordStrength] = useState<any>(null);

  const form = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: isPasswordReset ? "TEMP_PASSWORD_RESET" : "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Watch new password for strength validation
  const newPassword = form.watch("newPassword");
  
  // Update password strength when password changes
  useEffect(() => {
    if (newPassword) {
      const strength = validatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [newPassword]);

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await apiRequest("POST", "/api/auth/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi atualizada. Use a nova senha em seu próximo login.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Verifique sua senha atual e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ChangePasswordData) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Shield className="h-5 w-5" />
            Alterar Senha
          </DialogTitle>
          <DialogDescription>
            Para sua segurança, é recomendado alterar sua senha periodicamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isPasswordReset && (
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <PasswordInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Digite sua senha atual"
                        name="currentPassword"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Digite sua nova senha"
                      name="newPassword"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Confirme sua nova senha"
                      name="confirmPassword"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Strength Requirements - Always show when typing */}
            {newPassword && newPassword.length > 0 && (
              <div className="space-y-3">
                {/* Strength indicator */}
                {passwordStrength && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Força da senha:</span>
                      <span className={`font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score <= 1 ? 'bg-red-500' :
                          passwordStrength.score <= 2 ? 'bg-orange-500' :
                          passwordStrength.score <= 3 ? 'bg-yellow-500' :
                          passwordStrength.score <= 4 ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.max(10, (passwordStrength.score / 5) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Requirements checklist */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requisitos da senha:
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      {newPassword.length >= 8 ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                        Mínimo de 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {/[A-Z]/.test(newPassword) ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                        Pelo menos uma letra maiúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {/[a-z]/.test(newPassword) ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={/[a-z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                        Pelo menos uma letra minúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {/[0-9]/.test(newPassword) ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={/[0-9]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                        Pelo menos um número
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final validation */}
                {passwordStrength?.isValid && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Senha segura! Todos os critérios foram atendidos.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={changePasswordMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Lock className="h-4 w-4 mr-2" />
                {changePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}