import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, TrendingUp, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { loginSchema, registerUserSchema, type LoginData, type RegisterUser } from "@shared/schema";
import { formatCNPJ, formatPhone, consultCNPJ } from "@shared/validators";
import { validatePasswordStrength } from "@shared/passwordValidator";
import { ThemeToggle } from "@/components/theme-toggle";
import { PasswordInput } from "@/components/password-input";
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator";
import { ChangePasswordModal } from "@/components/change-password-modal";
import { useToast } from "@/hooks/use-toast";


export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { loginMutation, registerMutation, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [userRequiringPasswordChange, setUserRequiringPasswordChange] = useState<any>(null);

  // Get redirect URL from query parameters
  const getRedirectUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect') || null;
  };


  const [lastEmail, setLastEmail] = useState<string>("");
  const [lastPassword, setLastPassword] = useState<string>("");
  const [rememberCredentials, setRememberCredentials] = useState<boolean>(false);

  // Carregar dados do último acesso no useEffect
  useEffect(() => {
    const savedEmail = localStorage.getItem('lastEmail') || "";
    const savedPassword = localStorage.getItem('lastPassword') || "";
    const rememberPref = localStorage.getItem('rememberCredentials') === 'true';
    
    setLastEmail(savedEmail);
    setLastPassword(savedPassword);
    setRememberCredentials(rememberPref);
    
    // Se tiver dados salvos, marcar o checkbox automaticamente
    if (savedEmail || savedPassword) {
      setRememberCredentials(true);
    }
  }, []);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Atualizar formulário quando os dados carregarem
  useEffect(() => {
    if (lastEmail || lastPassword) {
      loginForm.reset({
        email: lastEmail,
        password: lastPassword,
      });
    }
  }, [lastEmail, lastPassword, loginForm]);



  const registerForm = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      cnpj: "",
      companyName: "",
      phone: "",
    },
    mode: "onChange"
  });

  const onLogin = (data: LoginData) => {
    // Validar campos obrigatórios
    if (!data.email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, digite seu email para fazer login.",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.password.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "Por favor, digite sua senha para fazer login.",
        variant: "destructive",
      });
      return;
    }

    // Salvar dados do último acesso se o usuário marcou a opção
    if (rememberCredentials) {
      localStorage.setItem('lastEmail', data.email);
      localStorage.setItem('lastPassword', data.password);
      localStorage.setItem('rememberCredentials', 'true');
    } else {
      // Limpar dados salvos se desmarcou a opção
      localStorage.removeItem('lastEmail');
      localStorage.removeItem('lastPassword');
      localStorage.removeItem('rememberCredentials');
    }
    
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        const user = response.user || response;
        console.log("Login successful, user:", user);
        console.log("User role:", user.role);
        console.log("User email:", user.email);
        
        // Check if password change is required
        if (response.requirePasswordChange) {
          setUserRequiringPasswordChange(user);
          setShowChangePasswordModal(true);
          return;
        }
        
        // Check for redirect URL first, then default behavior
        const redirectUrl = getRedirectUrl();
        if (redirectUrl) {
          console.log("Redirecting to:", redirectUrl);
          setLocation(redirectUrl);
        } else if (user.role === "admin" || user.email === "contato@profac.com.br") {
          console.log("Super admin detected, redirecting to /admin");
          setLocation("/admin");
        } else {
          console.log("Regular user, redirecting to /dashboard");
          setLocation("/dashboard");
        }
      },
    });
  };

  const onRegister = (data: RegisterUser) => {
    // Validar campos obrigatórios
    if (!data.email.trim()) {
      registerForm.setError("email", {
        type: "manual",
        message: "Email é obrigatório"
      });
      return;
    }
    
    if (!data.fullName.trim()) {
      registerForm.setError("fullName", {
        type: "manual",
        message: "Nome completo é obrigatório"
      });
      return;
    }
    
    if (!data.companyName.trim()) {
      registerForm.setError("companyName", {
        type: "manual",
        message: "Nome da empresa é obrigatório"
      });
      return;
    }
    
    // Validar força da senha antes do envio
    const passwordStrength = validatePasswordStrength(data.password);
    
    if (!passwordStrength.isValid) {
      registerForm.setError("password", {
        type: "manual",
        message: `Senha muito fraca. ${passwordStrength.feedback.join('. ')}`
      });
      return;
    }
    
    // Check for invitation token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');

    const registerData = inviteToken ? { ...data, inviteToken } : data;

    registerMutation.mutate(registerData, {
      onSuccess: () => {
        setActiveTab("login");
        registerForm.reset();
        setCurrentPassword("");
        setShowPasswordStrength(false);
      },
    });
  };

  // Check for invitation and error states in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    const error = urlParams.get('error');

    // Handle invitation-specific messaging
    if (inviteToken) {
      toast({
        title: "Convite Detectado!",
        description: "Você está cadastrando através de um convite. Complete seus dados para continuar.",
        variant: "default",
      });
      setActiveTab("register");
    }

    // Handle error states from invitation clicks
    if (error) {
      if (error === 'invalid_invite') {
        toast({
          title: "Convite Inválido",
          description: "O convite que você clicou não é válido ou já foi usado.",
          variant: "destructive",
        });
      } else if (error === 'expired_invite') {
        toast({
          title: "Convite Expirado",
          description: "Este convite expirou. Entre em contato para solicitar um novo.",
          variant: "destructive",
        });
      } else if (error === 'invite_error') {
        toast({
          title: "Erro no Convite",
          description: "Houve um problema ao processar seu convite. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  // Redirect if already authenticated - using useEffect to avoid hook violation
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check for redirect URL first, then default behavior
      const redirectUrl = getRedirectUrl();
      if (redirectUrl) {
        setLocation(redirectUrl);
      } else if (user.email === "contato@profac.com.br") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, user, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(210,79%,46%)] to-[hsl(210,79%,36%)] dark:from-[hsl(210,79%,40%)] dark:to-[hsl(210,79%,30%)] flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation("/")}
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Menu Principal
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Forms */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="text-center mb-8">
            <div className="bg-white text-[hsl(210,79%,46%)] px-6 py-3 rounded-lg font-bold text-2xl inline-block mb-4">
              PROFAC
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Hub de Gestão de Factoring
            </h1>
            <p className="text-gray-200">
              Sistema completo para gestão de operações de factoring
            </p>
          </div>

          <Card className="shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-center">
                Entre com suas credenciais ou solicite acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Solicitar Acesso</TabsTrigger>
                </TabsList>
                
                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="seu@email.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                                <PasswordInput
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Digite sua senha"
                                name="password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Checkbox para lembrar dados */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember-credentials"
                          checked={rememberCredentials}
                          onCheckedChange={(checked) => setRememberCredentials(checked as boolean)}
                        />
                        <label 
                          htmlFor="remember-credentials" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Lembrar email e senha neste dispositivo
                        </label>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)] px-12 py-3 text-lg font-semibold"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Entrando..." : "Entrar"}
                      </Button>
                      
                      <div className="text-center">
                        <Link href="/forgot-password">
                          <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
                            Esqueci minha senha
                          </Button>
                        </Link>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="space-y-4">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      {/* Primeira linha: Nome e Email */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Segunda linha: Senha e CNPJ */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <PasswordInput
                                  value={field.value}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    setCurrentPassword(value);
                                    setShowPasswordStrength(value.length > 0);
                                  }}
                                  placeholder=""
                                  name="password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CNPJ *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder=""
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    const formatted = formatCNPJ(value);
                                    field.onChange(formatted);
                                    
                                    // Limpa empresa quando CNPJ incompleto
                                    if (value.length < 14) {
                                      registerForm.setValue("companyName", "");
                                      registerForm.clearErrors("companyName");
                                    }
                                    
                                    // Consulta quando CNPJ completo
                                    if (value.length === 14) {
                                      registerForm.setValue("companyName", "Consultando...");
                                      
                                      consultCNPJ(value)
                                        .then((result) => {
                                          if (result.success && result.companyName) {
                                            registerForm.setValue("companyName", result.companyName);
                                            registerForm.clearErrors("companyName");
                                          } else {
                                            registerForm.setValue("companyName", "");
                                            registerForm.setError("companyName", {
                                              type: "manual",
                                              message: result.error || "CNPJ não encontrado"
                                            });
                                          }
                                        })
                                        .catch(() => {
                                          registerForm.setValue("companyName", "");
                                          registerForm.setError("companyName", {
                                            type: "manual",
                                            message: "Erro na consulta. Tente novamente."
                                          });
                                        });
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Password Strength Indicator - apenas quando há senha digitada */}
                      {showPasswordStrength && currentPassword.length > 0 && (
                        <div className="col-span-full">
                          <PasswordStrengthIndicator 
                            password={currentPassword} 
                            showRequirements={true}
                            autoHideWhenStrong={true}
                          />
                        </div>
                      )}

                      {/* Terceira linha: Nome da Empresa e Telefone */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="" 
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    const formatted = formatPhone(value);
                                    field.onChange(formatted);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)]"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Enviando..." : "Solicitar Acesso"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Seu pedido será analisado pelo administrador.<br />
                      Você receberá um e-mail quando for aprovado.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Hero */}
        <div className="hidden lg:block text-white">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                Sistema Profissional de Factoring
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                Gerencie suas operações com segurança, eficiência e controle total.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Shield className="h-12 w-12 mb-4 text-white" />
                <h3 className="text-lg font-semibold mb-2">Segurança Total</h3>
                <p className="text-gray-200 text-sm">
                  Controle de acesso rigoroso e dados criptografados
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Users className="h-12 w-12 mb-4 text-white" />
                <h3 className="text-lg font-semibold mb-2">Gestão de Clientes</h3>
                <p className="text-gray-200 text-sm">
                  Administração completa de carteira de clientes
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <TrendingUp className="h-12 w-12 mb-4 text-white" />
                <h3 className="text-lg font-semibold mb-2">Relatórios Avançados</h3>
                <p className="text-gray-200 text-sm">
                  Analytics e insights para tomada de decisão
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-2xl font-bold mb-2">99.9%</div>
                <h3 className="text-lg font-semibold mb-2">Disponibilidade</h3>
                <p className="text-gray-200 text-sm">
                  Sistema sempre online quando você precisar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Change Password Modal for required password changes */}
      {userRequiringPasswordChange && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => {
            setShowChangePasswordModal(false);
            setUserRequiringPasswordChange(null);
            // After password change, redirect appropriately
            if (userRequiringPasswordChange.email === "contato@profac.com.br") {
              setLocation("/admin");
            } else {
              setLocation("/dashboard");
            }
          }}
          userEmail={userRequiringPasswordChange.email}
          isPasswordReset={true}
        />
      )}
    </div>
  );
}