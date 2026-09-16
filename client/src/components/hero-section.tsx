import { Button } from "@/components/ui/button";
import { Shield, TrendingUp } from "lucide-react";

export function HeroSection() {
  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-gradient-to-br from-[hsl(210,79%,46%)] to-[hsl(210,79%,36%)] dark:from-[hsl(210,79%,40%)] dark:to-[hsl(210,79%,30%)] text-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Sistema PROFAC
              <span className="block text-[hsl(210,79%,66%)] text-2xl md:text-3xl lg:text-4xl mt-2">
                Gestão Completa para Factoring e Securitizadoras
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-200 leading-relaxed">
              Controle total sobre suas operações de factoring com segurança, praticidade e eficiência. 
              Desenvolvido especialmente para o setor financeiro brasileiro.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
              <Button 
                onClick={scrollToContact}
                className="bg-white text-[hsl(210,79%,46%)] hover:bg-gray-100 px-4 md:px-6 py-3 text-sm md:text-base font-medium w-full sm:w-auto"
              >
                Entre em Contato
              </Button>
              <Button 
                variant="outline" 
                onClick={scrollToFeatures}
                className="border-white text-white hover:bg-white hover:text-[hsl(210,79%,46%)] px-4 md:px-6 py-3 text-sm md:text-base font-medium bg-white/10 backdrop-blur-sm w-full sm:w-auto"
              >
                Conhecer Recursos
              </Button>
            </div>
          </div>
          <div className="lg:text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-8">
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-white/20 rounded-lg p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold">850+</div>
                  <div className="text-xs md:text-sm text-gray-200">Operações/Mês</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold">99.9%</div>
                  <div className="text-xs md:text-sm text-gray-200">Disponibilidade</div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center items-center space-x-4">
                  <Shield className="h-12 w-12 md:h-16 md:w-16 text-white/80" />
                  <TrendingUp className="h-12 w-12 md:h-16 md:w-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
