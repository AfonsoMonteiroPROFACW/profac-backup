import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, Database, ArrowLeft, AlertTriangle, Info } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Coleta de Informações",
      icon: Database,
      content: [
        "Coletamos apenas informações necessárias para o funcionamento do sistema",
        "Dados pessoais como nome, email, telefone e informações da empresa",
        "Informações de uso do sistema para melhorias e suporte técnico",
        "Dados de acesso e logs de segurança para proteção da plataforma"
      ]
    },
    {
      title: "Uso das Informações",
      icon: Eye,
      content: [
        "Fornecimento e manutenção dos serviços do PROFAC",
        "Comunicação sobre atualizações e novidades do sistema",
        "Suporte técnico e atendimento ao cliente",
        "Análises para melhoramento da plataforma"
      ]
    },
    {
      title: "Proteção de Dados",
      icon: Lock,
      content: [
        "Criptografia SSL/TLS em todas as transmissões de dados",
        "Armazenamento seguro em servidores protegidos",
        "Controle de acesso baseado em permissões",
        "Backups regulares e planos de recuperação de desastres"
      ]
    },
    {
      title: "Compartilhamento",
      icon: Shield,
      content: [
        "Não vendemos, alugamos ou compartilhamos dados pessoais",
        "Compartilhamento apenas quando exigido por lei",
        "Parceiros de confiança apenas para prestação de serviços",
        "Sempre com contratos de confidencialidade apropriados"
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
                    Privacidade
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
            <Shield className="h-12 w-12 text-[hsl(210,79%,46%)] mr-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Política de Privacidade
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Sua privacidade é fundamental. Esta política explica como coletamos, usamos e protegemos 
            suas informações pessoais no sistema PROFAC.
          </p>
        </div>

        {/* LGPD Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Conformidade com a LGPD:</strong> Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e garante seus direitos como titular de dados pessoais.
          </AlertDescription>
        </Alert>

        {/* Last Updated */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Última atualização: 30 de julho de 2025
          </p>
        </div>

        {/* Privacy Sections */}
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

        {/* Rights Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Seus Direitos (LGPD)</CardTitle>
            <CardDescription>
              Como titular de dados pessoais, você possui os seguintes direitos:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Acesso:</strong> Confirmar a existência de tratamento de dados
                  </span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Correção:</strong> Corrigir dados incompletos ou inexatos
                  </span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Anonimização:</strong> Solicitar anonimização de dados desnecessários
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Portabilidade:</strong> Transportar dados para outro fornecedor
                  </span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Eliminação:</strong> Excluir dados desnecessários
                  </span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Informação:</strong> Conhecer as finalidades do tratamento
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Privacy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contato para Questões de Privacidade</CardTitle>
            <CardDescription>
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Email:</strong> privacidade@profac.com.br
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Telefone:</strong> (11) 3456-7890
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Horário:</strong> Segunda a sexta, das 8h às 18h
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes Notice */}
        <Alert className="mb-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/50 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Alterações nesta Política:</strong> Reservamo-nos o direito de modificar esta política. Alterações significativas serão comunicadas com antecedência mínima de 30 dias.
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