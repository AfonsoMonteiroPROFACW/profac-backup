import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, Clock, MessageCircle, FileText, Download, Users, Settings, ArrowLeft, ExternalLink, HelpCircle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";

export default function SupportPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const supportChannels = [
    {
      icon: Phone,
      title: "Suporte Telefônico",
      description: "Atendimento especializado de segunda a sexta-feira",
      contact: "(11) 3456-7890",
      hours: "8h às 18h",
      availability: "Disponível",
      type: "urgent"
    },
    {
      icon: Mail,
      title: "Email de Suporte",
      description: "Envie sua dúvida e receba resposta em até 24 horas",
      contact: "contato@profac.com.br",
      hours: "24/7",
      availability: "Sempre Disponível",
      type: "normal"
    },
    {
      icon: MessageCircle,
      title: "Sistema de Tickets",
      description: "Abra um ticket para acompanhar o status da sua solicitação",
      contact: "Sistema Interno",
      hours: "24/7",
      availability: "Online",
      type: "tracking"
    }
  ];

  const serviceCategories = [
    {
      icon: Settings,
      title: "Suporte Técnico",
      description: "Instalação, configuração e resolução de problemas",
      items: [
        "Instalação do sistema PROFAC",
        "Configuração inicial",
        "Resolução de erros",
        "Atualizações de versão",
        "Backup e restauração"
      ]
    },
    {
      icon: Users,
      title: "Treinamento",
      description: "Capacitação para uso completo do sistema",
      items: [
        "Treinamento básico",
        "Treinamento avançado",
        "Workshops personalizados",
        "Documentação detalhada",
        "Vídeos tutoriais"
      ]
    },
    {
      icon: FileText,
      title: "Consultoria",
      description: "Orientação estratégica para otimização de processos",
      items: [
        "Análise de processos",
        "Otimização de fluxos",
        "Customizações",
        "Integração com outros sistemas",
        "Relatórios personalizados"
      ]
    }
  ];

  const faqItems = [
    {
      question: "Como faço para instalar o PROFAC?",
      answer: "Acesse a área de downloads em sua conta e baixe a versão mais recente. Execute o instalador e siga as instruções na tela. Em caso de dúvidas, nosso suporte está disponível para auxiliá-lo."
    },
    {
      question: "Esqueci minha senha, como recuperar?",
      answer: "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções enviadas por email. Se não receber o email, verifique sua caixa de spam ou entre em contato conosco."
    },
    {
      question: "Como abrir um ticket de suporte?",
      answer: "Faça login em sua conta e acesse a seção 'Contato' ou envie um email para contato@profac.com.br. Nosso sistema criará automaticamente um ticket para acompanhamento."
    },
    {
      question: "Qual o tempo de resposta do suporte?",
      answer: "Para questões urgentes por telefone: imediato durante horário comercial. Para emails e tickets: até 24 horas em dias úteis. Questões críticas têm prioridade no atendimento."
    },
    {
      question: "O PROFAC oferece treinamento?",
      answer: "Sim! Oferecemos treinamentos básicos e avançados, workshops personalizados e documentação completa. Entre em contato para agendar uma sessão de treinamento."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <div className="bg-[hsl(210,79%,46%)] text-white px-4 py-2 rounded-lg font-bold text-xl">
                  PROFAC
                </div>
              </Link>
              <nav className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-[hsl(210,79%,46%)] px-3 py-2 rounded-md text-sm font-medium">
                    Início
                  </Link>
                  <span className="text-[hsl(210,79%,46%)] px-3 py-2 rounded-md text-sm font-medium">
                    Suporte
                  </span>
                  {isAuthenticated && (
                    <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-[hsl(210,79%,46%)] px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </Link>
                  )}
                </div>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {!isAuthenticated && (
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="h-12 w-12 text-[hsl(210,79%,46%)] mr-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Central de Suporte
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Nossa equipe especializada está pronta para ajudá-lo em todas as suas necessidades. 
            Oferecemos suporte completo desde a instalação até o uso avançado do sistema PROFAC, 
            garantindo que sua empresa aproveite ao máximo todas as funcionalidades disponíveis.
          </p>
        </div>

        {/* Support Commitment */}
        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Nosso Compromisso:</strong> Garantimos resposta em até 24 horas para questões por email e atendimento imediato por telefone durante horário comercial.
          </AlertDescription>
        </Alert>

        {/* Support Channels */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Canais de Atendimento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <channel.icon className="h-8 w-8 text-[hsl(210,79%,46%)]" />
                    <Badge 
                      variant={channel.type === 'urgent' ? 'destructive' : 
                              channel.type === 'normal' ? 'default' : 'secondary'}
                    >
                      {channel.availability}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{channel.title}</CardTitle>
                  <CardDescription>{channel.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">{channel.contact}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{channel.hours}</span>
                    </div>
                    {channel.contact.includes('@') && (
                      <Button variant="outline" className="w-full mt-3">
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Email
                      </Button>
                    )}
                    {channel.contact.includes('(') && (
                      <Button variant="outline" className="w-full mt-3">
                        <Phone className="h-4 w-4 mr-2" />
                        Ligar Agora
                      </Button>
                    )}
                    {channel.title.includes('Tickets') && isAuthenticated && (
                      <Link href="/#contact" className="block">
                        <Button variant="outline" className="w-full mt-3">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Abrir Ticket
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Service Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Nossos Serviços
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {serviceCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <category.icon className="h-6 w-6 text-[hsl(210,79%,46%)] mr-3" />
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Perguntas Frequentes
          </h2>
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {faqItems.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base flex items-start">
                    <HelpCircle className="h-5 w-5 text-[hsl(210,79%,46%)] mr-3 mt-0.5 flex-shrink-0" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 ml-8">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Links Úteis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isAuthenticated && (
              <Link href="/dashboard">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="font-medium">Minha Conta</span>
                  <span className="text-xs text-gray-500">Gerenciar perfil</span>
                </Button>
              </Link>
            )}
            <Link href="/#downloads">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center">
                <Download className="h-6 w-6 mb-2" />
                <span className="font-medium">Downloads</span>
                <span className="text-xs text-gray-500">Última versão</span>
              </Button>
            </Link>
            <Link href="/#contact">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center">
                <MessageCircle className="h-6 w-6 mb-2" />
                <span className="font-medium">Contato</span>
                <span className="text-xs text-gray-500">Fale conosco</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center">
              <ExternalLink className="h-6 w-6 mb-2" />
              <span className="font-medium">Documentação</span>
              <span className="text-xs text-gray-500">Manuais e guias</span>
            </Button>
          </div>
        </div>

        {/* Emergency Contact */}
        <Alert className="mb-8 max-w-2xl mx-auto border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Suporte de Emergência:</strong> Para questões críticas que afetam operações importantes, ligue (11) 3456-7890 (Opção 1) ou envie email para urgente@profac.com.br - Disponível 24h para clientes com suporte premium.
          </AlertDescription>
        </Alert>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}