import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Scale, AlertTriangle, Clock, DollarSign, UserCheck, ArrowLeft, Info } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TermsPage() {
  const sections = [
    {
      title: "Aceitação dos Termos",
      icon: UserCheck,
      content: [
        "Ao utilizar o sistema PROFAC, você concorda com estes termos",
        "Se não concordar, interrompa imediatamente o uso da plataforma",
        "A utilização contínua constitui aceitação automática",
        "Estes termos são juridicamente vinculativos"
      ]
    },
    {
      title: "Uso Permitido",
      icon: FileText,
      content: [
        "O sistema deve ser usado apenas para fins comerciais legítimos",
        "Proibido uso para atividades ilegais ou fraudulentas",
        "Não compartilhar credenciais de acesso com terceiros",
        "Reportar imediatamente qualquer uso suspeito ou não autorizado"
      ]
    },
    {
      title: "Responsabilidades do Usuário",
      icon: Scale,
      content: [
        "Manter informações de login seguras e confidenciais",
        "Fornecer dados precisos e atualizados",
        "Utilizar o sistema conforme as leis aplicáveis",
        "Notificar imediatamente sobre violações de segurança"
      ]
    },
    {
      title: "Limitações de Responsabilidade",
      icon: AlertTriangle,
      content: [
        "O PROFAC não se responsabiliza por decisões baseadas nos dados",
        "Usuário assume riscos de suas operações comerciais",
        "Sistema fornecido 'como está' sem garantias específicas",
        "Limitação de responsabilidade conforme lei aplicável"
      ]
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
                    Termos de Uso
                  </span>
                </div>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Scale className="h-12 w-12 text-[hsl(210,79%,46%)] mr-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Termos de Uso
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Os termos e condições que regem o uso do sistema PROFAC. 
            Leia atentamente antes de utilizar nossa plataforma.
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Aviso Importante:</strong> Este é um documento juridicamente vinculativo. Ao usar o PROFAC, você concorda em cumprir todos os termos aqui estabelecidos.
          </AlertDescription>
        </Alert>

        {/* Last Updated */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Última atualização: 30 de julho de 2025
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <section.icon className="h-6 w-6 text-[hsl(210,79%,46%)] mr-3" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-[hsl(210,79%,46%)] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-600 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="h-6 w-6 text-[hsl(210,79%,46%)] mr-3" />
              Termos de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Licença de Uso</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Concedemos uma licença limitada, não exclusiva e revogável para uso do sistema 
                  PROFAC conforme estes termos.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Disponibilidade</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Nos esforçamos para manter 99,5% de disponibilidade, mas não garantimos 
                  funcionamento ininterrupto devido a manutenções necessárias.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Suporte Técnico</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Fornecemos suporte técnico durante horário comercial. Questões críticas 
                  recebem atendimento prioritário.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Clock className="h-6 w-6 text-[hsl(210,79%,46%)] mr-3" />
              Rescisão e Cancelamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Cancelamento pelo Usuário:</strong> Você pode cancelar a qualquer momento 
                através do painel administrativo ou entrando em contato conosco.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Rescisão por Violação:</strong> Reservamo-nos o direito de suspender ou 
                cancelar contas que violem estes termos.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Dados após Cancelamento:</strong> Seus dados serão mantidos por 90 dias 
                após cancelamento para eventual reativação.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Legal */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Disposições Legais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <strong>Lei Aplicável:</strong> Estes termos são regidos pelas leis brasileiras.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <strong>Foro:</strong> Fica eleito o foro da comarca de São Paulo/SP para 
                dirimir quaisquer controvérsias.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <strong>Modificações:</strong> Reservamo-nos o direito de modificar estes termos 
                com notificação prévia de 30 dias.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Legal */}
        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Dúvidas Legais:</strong> Para questões relacionadas aos termos de uso, 
            entre em contato através do email: juridico@profac.com.br
          </AlertDescription>
        </Alert>

        {/* Back to Home */}
        <div className="text-center">
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