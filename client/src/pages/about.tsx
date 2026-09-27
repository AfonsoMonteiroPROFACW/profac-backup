import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Award, Clock, Target, Shield, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AboutPage() {
  const milestones = [
    { year: "2020", title: "Fundação", description: "Início do desenvolvimento do sistema PROFAC" },
    { year: "2021", title: "Primeira Versão", description: "Lançamento da versão 1.0 para beta testing" },
    { year: "2022", title: "Expansão", description: "Mais de 50 empresas usando o sistema" },
    { year: "2023", title: "Modernização", description: "Nova interface e recursos avançados" },
    { year: "2024", title: "Cloud Integration", description: "Sistema totalmente integrado à nuvem" },
    { year: "2025", title: "Inovação Contínua", description: "Novas funcionalidades e melhorias constantes" }
  ];

  const features = [
    { icon: Shield, title: "Segurança", description: "Criptografia de ponta e proteção de dados" },
    { icon: Clock, title: "Eficiência", description: "Automação de processos complexos" },
    { icon: Users, title: "Colaboração", description: "Trabalho em equipe facilitado" },
    { icon: Target, title: "Precisão", description: "Relatórios detalhados e análises" }
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
                    Sobre
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="h-16 w-16 text-[hsl(210,79%,46%)] mr-4" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              Sobre o PROFAC
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            O PROFAC é um sistema completo de gestão desenvolvido especificamente para empresas de factoring no Brasil. 
            Nossa missão é simplificar e otimizar os processos financeiros, proporcionando eficiência e segurança 
            em todas as operações.
          </p>
        </div>

        {/* Company Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-[hsl(210,79%,46%)]/10 rounded-lg">
                    <feature.icon className="h-8 w-8 text-[hsl(210,79%,46%)]" />
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Target className="h-6 w-6 text-[hsl(210,79%,46%)] mr-3" />
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Fornecer soluções tecnológicas inovadoras que transformem a gestão de factoring no Brasil, 
                oferecendo ferramentas intuitivas, seguras e eficientes que permitam às empresas focar no 
                que realmente importa: o crescimento do negócio e o atendimento excepcional aos clientes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Award className="h-6 w-6 text-[hsl(210,79%,46%)] mr-3" />
                Nossa Visão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Ser a plataforma de referência em gestão de factoring no mercado brasileiro, reconhecida 
                pela qualidade, inovação e confiabilidade, contribuindo para o desenvolvimento e 
                modernização do setor financeiro nacional.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Nossa Jornada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map((milestone, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-[hsl(210,79%,46%)]/10 text-[hsl(210,79%,46%)] border-[hsl(210,79%,46%)]/20">
                      {milestone.year}
                    </Badge>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <CardTitle className="text-lg">{milestone.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{milestone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Tecnologia de Ponta</CardTitle>
            <CardDescription className="text-center">
              Desenvolvido com as melhores práticas e tecnologias modernas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">Frontend</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">React, TypeScript</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">Backend</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Node.js, Express</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">Banco de Dados</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">MySQL</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">Segurança</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">SSL/TLS, Criptografia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="text-center bg-[hsl(210,79%,46%)]/5 dark:bg-[hsl(210,79%,46%)]/10 border-[hsl(210,79%,46%)]/20">
          <CardHeader>
            <CardTitle className="text-2xl text-[hsl(210,79%,46%)]">
              Pronto para Transformar Sua Gestão?
            </CardTitle>
            <CardDescription>
              Entre em contato conosco e descubra como o PROFAC pode revolucionar sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#contact">
                <Button size="lg" className="bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)]">
                  Entrar em Contato
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" size="lg">
                  Central de Suporte
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}