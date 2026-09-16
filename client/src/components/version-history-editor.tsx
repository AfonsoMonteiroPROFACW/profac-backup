import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { VersionHistory, Download } from "@shared/schema";

export function VersionHistoryEditor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const isSuperAdmin = user?.email === "contato@profac.com.br";

  const { data: versionHistory } = useQuery<VersionHistory[]>({
    queryKey: ["/api/version-history"],
  });

  const { data: downloads } = useQuery<Download[]>({
    queryKey: ["/api/downloads"],
  });

  const currentHistory = versionHistory && versionHistory.length > 0 ? versionHistory[0] : null;
  const currentVersion = downloads && downloads.length > 0 ? downloads[0].version : "N/A";

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("PUT", "/api/version-history", { content });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/version-history"] });
      toast({
        title: "Histórico atualizado",
        description: "As informações de versão foram salvas com sucesso.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setEditContent(currentHistory?.content || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    saveMutation.mutate(editContent);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent("");
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Histórico de Versões
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Novidades da versão atual
            </CardDescription>
          </div>
          {isSuperAdmin && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Versão {currentVersion}
            </h4>
            <div className="flex gap-2">
              <Badge variant="default">Atual</Badge>
              {currentHistory?.updatedAt && (
                <Badge variant="outline">
                  {new Date(currentHistory.updatedAt).toLocaleDateString('pt-BR')}
                </Badge>
              )}
            </div>
          </div>
            
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-40 font-mono text-sm"
                placeholder="Digite o histórico de versões..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saveMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border text-gray-800 dark:text-gray-200 font-mono leading-relaxed max-h-60 overflow-y-auto">
              {currentHistory?.content || "Nenhum histórico de versões disponível. Clique em 'Editar' para adicionar conteúdo."}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}