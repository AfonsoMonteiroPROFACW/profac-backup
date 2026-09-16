import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Clock, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertContact } from "@shared/schema";

export function ContactSection() {
  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const response = await apiRequest("POST", "/api/tickets", ticketData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso. Um ticket de suporte foi criado e entraremos em contato em breve.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !subject || !message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Transform contact data to ticket format
    const ticketData = {
      title: subject,
      description: message,
      customerName: name,
      customerEmail: email,
      customerPhone: phone || null,
      category: "general",
      priority: "medium",
      status: "open"
    };

    contactMutation.mutate(ticketData);
    e.currentTarget.reset();
  };

  return (
    <section id="contact" className="py-20 bg-[hsl(210,79%,96%)] dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Entre em Contato</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Precisa de ajuda ou tem dúvidas? Nossa equipe está pronta para atendê-lo
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="font-semibold text-xl mb-6 text-gray-900 dark:text-white">Informações de Contato</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-[hsl(210,79%,46%)]/10 rounded-lg p-3 mr-4">
                  <Mail className="h-6 w-6 text-[hsl(210,79%,46%)]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-gray-600 dark:text-gray-400">contato@profac.com.br</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-[hsl(210,79%,46%)]/10 rounded-lg p-3 mr-4">
                  <Phone className="h-6 w-6 text-[hsl(210,79%,46%)]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Telefone</p>
                  <p className="text-gray-600 dark:text-gray-400">(81) 4101-9863</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3 mr-4">
                  <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">WhatsApp</p>
                  <p className="text-gray-600 dark:text-gray-400">(81) 99111-9005</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-[hsl(210,79%,46%)]/10 rounded-lg p-3 mr-4">
                  <Clock className="h-6 w-6 text-[hsl(210,79%,46%)]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Horário de Atendimento</p>
                  <p className="text-gray-600 dark:text-gray-400">Segunda a Sexta: 09:00 às 18:00 horas</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-xl mb-6 text-gray-900 dark:text-white">Envie sua mensagem</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-900 dark:text-white">Nome *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Seu nome completo" 
                    required 
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-900 dark:text-white">Email *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    required 
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-gray-900 dark:text-white">Telefone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    placeholder="(11) 99999-9999" 
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-gray-900 dark:text-white">Assunto *</Label>
                  <Select name="subject" required>
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Selecione o assunto" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectItem value="comercial" className="text-gray-900 dark:text-white">Informações Comerciais</SelectItem>
                      <SelectItem value="suporte" className="text-gray-900 dark:text-white">Suporte Técnico</SelectItem>
                      <SelectItem value="demonstracao" className="text-gray-900 dark:text-white">Solicitar Demonstração</SelectItem>
                      <SelectItem value="outros" className="text-gray-900 dark:text-white">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="message" className="text-gray-900 dark:text-white">Mensagem *</Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  rows={4} 
                  placeholder="Conte-nos como podemos ajudá-lo..."
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={contactMutation.isPending}
                className="w-full bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)]"
              >
                {contactMutation.isPending ? "Enviando..." : "Enviar Mensagem"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
