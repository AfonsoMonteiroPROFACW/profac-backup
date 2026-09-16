import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqData = [
  {
    question: "Como posso obter acesso ao sistema PROFAC?",
    answer: "Para obter acesso ao sistema PROFAC, entre em contato conosco através do formulário de contato ou por telefone. Nossa equipe comercial irá orientá-lo sobre os planos disponíveis e o processo de implementação."
  },
  {
    question: "O sistema é compatível com qual versão do Windows?",
    answer: "O sistema PROFAC é compatível com Windows 10 e Windows 11. Recomendamos sempre utilizar a versão mais recente do Windows para melhor performance e segurança."
  },
  {
    question: "Como funciona o suporte técnico?",
    answer: "Oferecemos suporte técnico de segunda a sexta-feira, das 8h às 18h. Você pode entrar em contato por telefone, email ou através do sistema de tickets dentro do próprio software."
  },
  {
    question: "O sistema atende às normas do Banco Central?",
    answer: "Sim, o sistema PROFAC foi desenvolvido seguindo todas as regulamentações do Banco Central do Brasil para empresas de factoring, incluindo geração automática de relatórios obrigatórios."
  },
  {
    question: "Como são feitas as atualizações do sistema?",
    answer: "As atualizações são disponibilizadas através da área de downloads do site. Clientes ativos recebem notificações por email sempre que uma nova versão é lançada."
  },
  {
    question: "Posso testar o sistema antes de comprar?",
    answer: "Sim, oferecemos uma versão de demonstração do sistema. Entre em contato conosco para agendar uma apresentação personalizada ou solicitar acesso temporário."
  },
  {
    question: "O sistema possui integração com bancos?",
    answer: "Sim, o sistema PROFAC possui integração com os principais bancos do Brasil, incluindo funcionalidades para consulta de saldos, extratos e transferências via API bancária."
  },
  {
    question: "Como é feito o backup dos dados?",
    answer: "O sistema possui backup automático configurável, podendo ser realizado localmente ou em nuvem. Recomendamos backups diários para garantir a segurança dos dados."
  }
];

export function FaqSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Perguntas Frequentes</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o sistema PROFAC
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-gray-200 dark:border-gray-700">
              <AccordionTrigger className="text-left font-medium text-gray-900 dark:text-white hover:text-[hsl(210,79%,46%)] dark:hover:text-[hsl(210,79%,56%)]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-300">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
