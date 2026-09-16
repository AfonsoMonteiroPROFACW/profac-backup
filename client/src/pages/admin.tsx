import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Download, Ticket, ArrowLeft, Settings, Shield, BarChart3, Mail, Server, MessageSquare, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { logoutMutation } = useAuth();

  const adminSections = [
    {
      title: "Gestão de Usuários",
      description: "Gerencie usuários, aprove solicitações e controle acessos",
      icon: Users,
      path: "/admin/users",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
    },
    {
      title: "Gestão de Downloads",
      description: "Gerencie o histórico de versões e downloads do sistema",
      icon: Download,
      path: "/admin/downloads",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30",
    },
    {
      title: "Sistema de Tickets",
      description: "Gerencie solicitações de suporte dos clientes",
      icon: Ticket,
      path: "/admin/tickets",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30",
    },
    {
      title: "Email Convite",
      description: "Envie convites por email e acompanhe as conversões",
      icon: Mail,
      path: "/admin/invitations",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30",
    },
    {
      title: "Configuração de Email",
      description: "Configure o servidor SMTP para notificações automáticas",
      icon: Settings,
      path: "/admin/email",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
    },
    {
      title: "Configuração FTP",
      description: "Configure o servidor FTP para gerenciamento de downloads",
      icon: Server,
      path: "/admin/ftp",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30",
    },
    {
      title: "Gerenciar Comentários",
      description: "Aprovar, editar e renovar comentários de clientes",
      icon: MessageSquare,
      path: "/admin/comments",
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/30",
    },
    {
      title: "Badges de Segurança",
      description: "Configure badges customizáveis para construir confiança dos usuários",
      icon: Shield,
      path: "/admin/security-badges",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30",
    },
    {
      title: "Estatísticas de Acesso",
      description: "Acompanhe métricas de visitação diárias e mensais do site",
      icon: BarChart3,
      path: "/admin/analytics",
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 relative">
        {/* Botões de navegação elegantes no canto superior direito */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
          <Button
            onClick={() => setLocation("/dashboard")}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-full font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Menu Principal
          </Button>
          <Button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-full font-medium"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <span>Painel Administrativo</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Central de controle e gerenciamento do sistema PROFAC
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Módulos Ativos</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminSections.length}</div>
                <p className="text-xs text-muted-foreground">
                  Módulos administrativos disponíveis
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acesso Total</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
                <p className="text-xs text-muted-foreground">
                  Privilégios administrativos completos
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistema</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">ATIVO</div>
                <p className="text-xs text-muted-foreground">
                  Todos os serviços funcionando
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Sections Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {adminSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Card
                  key={section.path}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${section.bgColor} border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-600`}
                  onClick={() => setLocation(section.path)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-md">
                        <IconComponent className={`w-8 h-8 ${section.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <Button
                      variant="outline"
                      className="w-full border-2 hover:bg-white dark:hover:bg-gray-800"
                    >
                      Acessar Módulo
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">
                    Área restrita - Acesso limitado a administradores autorizados
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}