import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogIn, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const navItems = [
    { href: "/", label: "Início" },
    { href: "#features", label: "Recursos" },
    { href: "#downloads", label: "Downloads" },
    { href: "#comments", label: "Comentários" },
    { href: "#contact", label: "Contato" },
    { href: "/support", label: "Suporte" },
  ];

  const handleScrollToSection = (sectionId: string) => {
    if (sectionId === "/") {
      // Para a página inicial, fazer scroll para o topo
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (sectionId === "#downloads") {
      // Downloads tem acesso restrito para download, mas pode visualizar
      const element = document.getElementById("downloads");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      // Se não autenticado, mostrar aviso
      if (!isAuthenticated) {
        setTimeout(() => {
          toast({
            title: "Acesso Restrito",
            description: "Somente usuários autenticados podem realizar downloads. Faça login para acessar esta funcionalidade.",
            variant: "destructive",
            duration: 5000,
          });
        }, 500);
      }
    } else if (sectionId.startsWith("#")) {
      const element = document.getElementById(sectionId.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (sectionId === "/support") {
      // Suporte requer autenticação
      if (isAuthenticated) {
        window.location.href = "/support";
      } else {
        toast({
          title: "Acesso Restrito",
          description: "Somente usuários autenticados podem acessar o suporte. Faça login para acessar esta funcionalidade.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <div className="bg-[hsl(210,79%,46%)] text-white px-4 py-2 rounded-lg font-bold text-xl">
                PROFAC
              </div>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleScrollToSection(item.href)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === item.href
                        ? "text-[hsl(210,79%,46%)]"
                        : "text-gray-600 dark:text-gray-300 hover:text-[hsl(210,79%,46%)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Auth buttons - desktop */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {user?.fullName || "Dashboard"}
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button size="sm" className="bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)]">
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden px-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-4">
                <div className="flex flex-col space-y-2">
                  <div className="text-lg font-semibold mb-4 text-[hsl(210,79%,46%)] flex items-center">
                    <div className="bg-[hsl(210,79%,46%)] text-white px-2 py-1 rounded text-sm font-bold mr-2">
                      PROFAC
                    </div>
                    Menu
                  </div>
                  {navItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleScrollToSection(item.href)}
                      className="text-left px-3 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[hsl(210,79%,46%)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  
                  {/* Auth section - mobile */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-3">
                          Logado como: <span className="font-medium">{user?.fullName}</span>
                        </div>
                        <Link href="/dashboard">
                          <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                            <User className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => logoutMutation.mutate()}
                          disabled={logoutMutation.isPending}
                          className="w-full justify-start bg-red-600 hover:bg-red-700"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair
                        </Button>
                      </div>
                    ) : (
                      <Link href="/auth">
                        <Button className="w-full bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)] text-sm" size="sm">
                          <LogIn className="h-4 w-4 mr-2" />
                          Entrar
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
