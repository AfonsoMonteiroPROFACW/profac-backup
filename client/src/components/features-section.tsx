import { 
  FileText, 
  DollarSign, 
  Shield, 
  Users, 
  BarChart3, 
  CheckCircle 
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Gestão de Títulos",
    description: "Controle completo de duplicatas, notas fiscais e títulos de crédito com rastreamento em tempo real."
  },
  {
    icon: DollarSign,
    title: "Análise Financeira",
    description: "Relatórios detalhados, análise de risco e projeções para tomada de decisões estratégicas."
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Criptografia avançada, backup automático e auditoria completa de todas as operações."
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Cadastro completo, histórico de operações e análise de perfil de risco dos cedentes."
  },
  {
    icon: BarChart3,
    title: "Dashboard Executivo",
    description: "Visão geral da carteira, indicadores de performance e alertas em tempo real."
  },
  {
    icon: CheckCircle,
    title: "Compliance",
    description: "Conformidade com regulamentações do Banco Central e geração automática de relatórios."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Recursos Principais</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Funcionalidades desenvolvidas especificamente para otimizar sua operação de factoring, sem quebra de linha.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="bg-[hsl(210,79%,46%)]/10 rounded-lg p-3 w-fit mb-4">
                <feature.icon className="h-8 w-8 text-[hsl(210,79%,46%)]" />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
