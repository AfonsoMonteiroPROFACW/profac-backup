import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { forgotPasswordSchema, type User } from "@shared/schema";
import { z } from "zod";

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: localStorage.getItem('lastEmail') || "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      return response.json();
    },
    onSuccess: (data) => {
      setEmailSent(true);
      setSentEmail(form.getValues("email"));
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para a nova senha temporária.",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Erro ao solicitar nova senha. Tente novamente.";
      
      if (error.response) {
        try {
          const errorData = JSON.parse(error.response);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // Use default message
        }
      }
      
      toast({
        title: "Erro ao enviar email",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotPasswordData) => {
    forgotPasswordMutation.mutate(data);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Email Enviado!</CardTitle>
              <CardDescription className="mt-2">
                Enviamos uma senha temporária para:
                <br />
                <strong className="text-foreground">{sentEmail}</strong>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Próximos passos:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Verifique sua caixa de entrada (e spam)</li>
                  <li>Use a senha temporária para fazer login</li>
                  <li>Crie uma nova senha quando solicitado</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Link href="/auth">
                <Button className="w-full bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,40%)]">
                  Ir para Login
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setSentEmail("");
                  form.reset();
                }}
              >
                Enviar para outro email
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Não recebeu o email? Aguarde alguns minutos ou verifique sua pasta de spam.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-xl">Esqueci minha senha</CardTitle>
            <CardDescription className="mt-2">
              Digite seu email para receber uma senha temporária
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                        disabled={forgotPasswordMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Você receberá uma senha temporária por email que deve ser alterada no próximo login.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,40%)]"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? "Enviando..." : "Enviar Nova Senha"}
                </Button>
                
                <Link href="/auth">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Login
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}