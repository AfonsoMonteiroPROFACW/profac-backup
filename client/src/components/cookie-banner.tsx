import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, X, Settings, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  const acceptSelected = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
  };

  const rejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    if (key === 'necessary') return; // Cannot change necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-[hsl(210,79%,46%)] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Utilizamos Cookies
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Este site utiliza cookies para melhorar sua experiência de navegação, realizar análises e 
                    personalizar conteúdo. Ao continuar navegando, você concorda com nossa 
                    <Button variant="link" className="p-0 h-auto text-sm underline ml-1">
                      Política de Privacidade
                    </Button> e uso de cookies conforme a LGPD.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center">
                        <Cookie className="h-5 w-5 mr-2" />
                        Configurações de Cookies
                      </DialogTitle>
                      <DialogDescription>
                        Gerencie suas preferências de cookies. Cookies necessários não podem ser desabilitados.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium text-gray-900 dark:text-white">
                              Cookies Necessários
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Essenciais para o funcionamento do site
                            </p>
                          </div>
                          <Switch checked={true} disabled />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium text-gray-900 dark:text-white">
                              Cookies de Análise
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Nos ajudam a melhorar o site
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.analytics}
                            onCheckedChange={(checked) => updatePreference('analytics', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium text-gray-900 dark:text-white">
                              Cookies Funcionais
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Lembram suas preferências
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.functional}
                            onCheckedChange={(checked) => updatePreference('functional', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium text-gray-900 dark:text-white">
                              Cookies de Marketing
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Para personalizar conteúdo
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.marketing}
                            onCheckedChange={(checked) => updatePreference('marketing', checked)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={acceptSelected} className="flex-1">
                          <Check className="h-4 w-4 mr-2" />
                          Salvar Preferências
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="sm" onClick={rejectOptional} className="w-full sm:w-auto">
                  Rejeitar Opcionais
                </Button>
                
                <Button onClick={acceptAll} size="sm" className="w-full sm:w-auto bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)]">
                  Aceitar Todos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}