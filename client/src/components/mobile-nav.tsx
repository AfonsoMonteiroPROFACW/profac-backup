import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Download, MessageSquare, Phone, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileNav() {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  if (!isMobile) return <div />;

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navItems = [
    { id: "home", label: "Início", icon: Home },
    { id: "downloads", label: "Downloads", icon: Download },
    { id: "comments", label: "Comentários", icon: MessageSquare },
    { id: "contact", label: "Contato", icon: Phone },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection(id)}
            className="flex flex-col items-center space-y-1 px-2 py-2 h-auto min-w-0"
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
        {isAuthenticated ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/dashboard'}
            className="flex flex-col items-center space-y-1 px-2 py-2 h-auto min-w-0"
          >
            <User className="h-4 w-4" />
            <span className="text-xs">Dashboard</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/auth'}
            className="flex flex-col items-center space-y-1 px-2 py-2 h-auto min-w-0"
          >
            <User className="h-4 w-4" />
            <span className="text-xs">Login</span>
          </Button>
        )}
      </div>
    </div>
  );
}