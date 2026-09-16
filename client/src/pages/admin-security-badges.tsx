import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Shield, Settings, Eye, Save, Plus, Trash2, Edit, Check, X } from "lucide-react";
import { SecurityBadges, SecuritySummary, BADGE_PRESETS } from "@/components/security-badges";

interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  selectedBadges: string[];
  layout: "horizontal" | "vertical" | "grid";
  size: "sm" | "md" | "lg";
  showTooltips: boolean;
  isActive: boolean;
}

const defaultConfig: BadgeConfig = {
  id: '',
  name: '',
  description: '',
  selectedBadges: BADGE_PRESETS.standard,
  layout: "horizontal",
  size: "sm",
  showTooltips: true,
  isActive: false
};

const availableBadges = [
  { id: "verified-safe", label: "Verificado Seguro" },
  { id: "ssl-protected", label: "SSL Protegido" },
  { id: "authentic-source", label: "Fonte Autêntica" },
  { id: "fast-download", label: "Download Rápido" },
  { id: "integrity-check", label: "Integridade Verificada" },
  { id: "no-malware", label: "Livre de Malware" }
];

export default function AdminSecurityBadges() {
  const [configs, setConfigs] = useState<BadgeConfig[]>([
    {
      id: '1',
      name: 'Configuração Padrão',
      description: 'Badges básicos de segurança para downloads',
      selectedBadges: BADGE_PRESETS.standard,
      layout: 'horizontal',
      size: 'sm',
      showTooltips: true,
      isActive: true
    },
    {
      id: '2',
      name: 'Configuração Premium',
      description: 'Todas as garantias de segurança para clientes VIP',
      selectedBadges: BADGE_PRESETS.enterprise,
      layout: 'grid',
      size: 'md',
      showTooltips: true,
      isActive: false
    }
  ]);
  
  const [editingConfig, setEditingConfig] = useState<BadgeConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSaveConfig = (config: BadgeConfig) => {
    if (isCreating) {
      const newConfig = { ...config, id: Date.now().toString() };
      setConfigs([...configs, newConfig]);
      toast({
        title: "Configuração criada",
        description: "Nova configuração de badges foi adicionada com sucesso.",
      });
    } else {
      setConfigs(configs.map(c => c.id === config.id ? config : c));
      toast({
        title: "Configuração atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    }
    setEditingConfig(null);
    setIsCreating(false);
  };

  const handleDeleteConfig = (id: string) => {
    setConfigs(configs.filter(c => c.id !== id));
    toast({
      title: "Configuração removida",
      description: "A configuração foi excluída com sucesso.",
    });
  };

  const handleActivateConfig = (id: string) => {
    setConfigs(configs.map(c => ({ ...c, isActive: c.id === id })));
    toast({
      title: "Configuração ativada",
      description: "Esta configuração agora está sendo usada no sistema.",
    });
  };

  const handleToggleBadge = (config: BadgeConfig, badgeId: string) => {
    const newSelectedBadges = config.selectedBadges.includes(badgeId)
      ? config.selectedBadges.filter(id => id !== badgeId)
      : [...config.selectedBadges, badgeId];
    
    const updatedConfig = { ...config, selectedBadges: newSelectedBadges };
    setEditingConfig(updatedConfig);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-[hsl(210,79%,46%)]" />
            Configuração de Badges de Segurança
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as badges de segurança exibidas nos downloads para construir confiança dos usuários
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingConfig(defaultConfig);
            setIsCreating(true);
          }}
          className="bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      {/* Preview da Configuração Ativa */}
      {(() => {
        const activeConfig = configs.find(c => c.isActive);
        return activeConfig ? (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
                <Check className="h-5 w-5" />
                Configuração Ativa: {activeConfig.name}
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Esta é a configuração atualmente exibida para os usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityBadges
                selectedBadges={activeConfig.selectedBadges}
                layout={activeConfig.layout}
                size={activeConfig.size}
                showTooltips={activeConfig.showTooltips}
              />
            </CardContent>
          </Card>
        ) : null;
      })()}

      {/* Lista de Configurações */}
      <div className="grid gap-4">
        {configs.map((config) => (
          <Card key={config.id} className={config.isActive ? "border-green-200" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {config.name}
                    {config.isActive && (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        Ativa
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingConfig(config)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!config.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivateConfig(config.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConfig(config.id)}
                    disabled={config.isActive}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Preview</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    <SecurityBadges
                      selectedBadges={config.selectedBadges}
                      layout={config.layout}
                      size={config.size}
                      showTooltips={config.showTooltips}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label>Layout</Label>
                    <p className="text-muted-foreground">{config.layout}</p>
                  </div>
                  <div>
                    <Label>Tamanho</Label>
                    <p className="text-muted-foreground">{config.size}</p>
                  </div>
                  <div>
                    <Label>Tooltips</Label>
                    <p className="text-muted-foreground">{config.showTooltips ? "Sim" : "Não"}</p>
                  </div>
                  <div>
                    <Label>Badges</Label>
                    <p className="text-muted-foreground">{config.selectedBadges.length} selecionadas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Edição */}
      {editingConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {isCreating ? "Nova Configuração" : "Editar Configuração"}
              </CardTitle>
              <CardDescription>
                Configure as badges de segurança que serão exibidas aos usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Configuração</Label>
                  <Input
                    id="name"
                    value={editingConfig.name}
                    onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
                    placeholder="Ex: Configuração Premium"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={editingConfig.description}
                    onChange={(e) => setEditingConfig({ ...editingConfig, description: e.target.value })}
                    placeholder="Descreva o propósito desta configuração"
                  />
                </div>
              </div>

              <Separator />

              {/* Seleção de Badges */}
              <div>
                <Label>Badges de Segurança</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione quais badges serão exibidas aos usuários
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        editingConfig.selectedBadges.includes(badge.id)
                          ? "border-[hsl(210,79%,46%)] bg-[hsl(210,79%,46%)]/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleToggleBadge(editingConfig, badge.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{badge.label}</span>
                        {editingConfig.selectedBadges.includes(badge.id) && (
                          <Check className="h-4 w-4 text-[hsl(210,79%,46%)]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Configurações de Layout */}
              <div className="space-y-4">
                <div>
                  <Label>Layout</Label>
                  <Select
                    value={editingConfig.layout}
                    onValueChange={(value: "horizontal" | "vertical" | "grid") => 
                      setEditingConfig({ ...editingConfig, layout: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                      <SelectItem value="grid">Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tamanho</Label>
                  <Select
                    value={editingConfig.size}
                    onValueChange={(value: "sm" | "md" | "lg") => 
                      setEditingConfig({ ...editingConfig, size: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Pequeno</SelectItem>
                      <SelectItem value="md">Médio</SelectItem>
                      <SelectItem value="lg">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="tooltips"
                    checked={editingConfig.showTooltips}
                    onCheckedChange={(checked) => 
                      setEditingConfig({ ...editingConfig, showTooltips: checked })
                    }
                  />
                  <Label htmlFor="tooltips">Mostrar tooltips explicativos</Label>
                </div>
              </div>

              <Separator />

              {/* Preview */}
              <div>
                <Label>Preview</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <SecurityBadges
                    selectedBadges={editingConfig.selectedBadges}
                    layout={editingConfig.layout}
                    size={editingConfig.size}
                    showTooltips={editingConfig.showTooltips}
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingConfig(null);
                    setIsCreating(false);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleSaveConfig(editingConfig)}
                  className="bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}