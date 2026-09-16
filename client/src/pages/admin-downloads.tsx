import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Download as DownloadIcon, AlertCircle, ArrowLeft, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertDownloadSchema, type Download, type InsertDownload } from "@shared/schema";
import { formatDate } from "@/lib/authUtils";
import { PageTransition } from "@/components/page-transition";
import { useLocation } from "wouter";
import { DownloadProgressModal } from "@/components/download-progress-modal";

function DownloadModal({ download, onClose }: { download?: Download; onClose: () => void }) {
  const { toast } = useToast();
  const isEditing = !!download;

  const form = useForm<InsertDownload>({
    resolver: zodResolver(insertDownloadSchema),
    defaultValues: {
      version: "",
      fileName: "",
      fileSize: "",
      description: "",
      changeLog: "",
      isActive: true,
      isBeta: false,
    },
  });

  // Reset form when download data changes (for editing)
  useEffect(() => {
    if (download) {
      form.reset({
        version: download.version || "",
        fileName: download.fileName || "",
        fileSize: download.fileSize || "",
        description: download.description || "",
        changeLog: download.changeLog || "",
        isActive: download.isActive ?? true,
        isBeta: download.isBeta ?? false,
      });
    } else {
      form.reset({
        version: "",
        fileName: "",
        fileSize: "",
        description: "",
        changeLog: "",
        isActive: true,
        isBeta: false,
      });
    }
  }, [download, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertDownload) => {
      const url = isEditing ? `/api/admin/downloads/${download.id}` : "/api/admin/downloads";
      const method = isEditing ? "PUT" : "POST";
      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/downloads"] });
      toast({
        title: `Download ${isEditing ? "atualizado" : "criado"} com sucesso`,
        description: `Versão ${form.getValues("version")} foi ${isEditing ? "atualizada" : "adicionada"} ao histórico.`,
      });
      onClose();
    },
    onError: (error: Error) => {
      console.error("Save mutation error:", error);
      console.error("Error details:", error.message);
      toast({
        title: `Erro ao ${isEditing ? "atualizar" : "criar"} download`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDownload) => {
    console.log("Form data being submitted:", data);
    console.log("Is editing:", isEditing);
    console.log("API URL:", isEditing ? `/api/admin/downloads/${download.id}` : "/api/admin/downloads");
    saveMutation.mutate(data);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? `Editar Versão ${download.version}` : "Adicionar Nova Versão"}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Versão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2.5.4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fileSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho do Arquivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 45.2 MB" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="fileName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Arquivo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: PROFAC_Setup_v2.5.4.exe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descrição da versão e principais melhorias..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="changeLog"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Log de Mudanças</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="- Correção de bugs&#10;- Novas funcionalidades&#10;- Melhorias de performance"
                    rows={4}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Disponível para download
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isBeta"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Versão Beta</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Versão de teste
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}

export default function AdminDownloads() {
  const [selectedDownload, setSelectedDownload] = useState<Download | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: downloads, isLoading } = useQuery<Download[]>({
    queryKey: ["/api/admin/downloads"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/downloads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/downloads"] });
      toast({
        title: "Download excluído",
        description: "Versão removida do histórico com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir download",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/test-version-notification");
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Teste de notificação concluído",
        description: `${data.result} - Sistema funcionando corretamente!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no teste de notificação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (download: Download) => {
    setSelectedDownload(download);
    setShowModal(true);
  };

  const handleDelete = (download: Download) => {
    deleteMutation.mutate(download.id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDownload(undefined);
  };

  // Download progress modal state
  const [progressModal, setProgressModal] = useState<{
    isOpen: boolean;
    progress: number;
    status: 'downloading' | 'processing' | 'complete' | 'error';
    fileName: string;
    message: string;
    fileSize: string;
    downloadSpeed: string;
    timeRemaining: string;
  }>({
    isOpen: false,
    progress: 0,
    status: 'downloading',
    fileName: "",
    message: "",
    fileSize: "",
    downloadSpeed: "",
    timeRemaining: "",
  });

  // Download mutation with progress modal
  const downloadMutation = useMutation({
    mutationFn: async (download: Download) => {
      setProgressModal({
        isOpen: true,
        progress: 0,
        status: 'downloading',
        fileName: download.fileName || "",
        message: "Validando servidor FTP",
        fileSize: download.fileSize || "",
        downloadSpeed: "",
        timeRemaining: "",
      });

      // Simulate progress stages  
      const stages = [
        { progress: 20, status: 'downloading' as const, message: "🔗 Conectando ao servidor..." },
        { progress: 40, status: 'downloading' as const, message: "📋 Verificando arquivo..." },
        { progress: 60, status: 'processing' as const, message: "⚡ Iniciando transferência..." },
        { progress: 80, status: 'processing' as const, message: "📥 Transferindo dados..." },
        { progress: 100, status: 'complete' as const, message: "✅ Download iniciado!\n\nO arquivo está sendo transferido para seu computador.\nAguarde o download completar antes de fechar esta janela." }
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgressModal(prev => ({
          ...prev,
          progress: stage.progress,
          status: stage.status,
          message: stage.message,
        }));
      }

      const res = await apiRequest("POST", `/api/downloads/${download.id}/download`);
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.downloadUrl) {
        // Usar link temporário para evitar .crdownload
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName || 'setup.exe';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
      }
      // Manter modal aberto por mais tempo para acompanhar o download
      setTimeout(() => {
        setProgressModal(prev => ({ ...prev, isOpen: false }));
      }, 5000); // Aguardar 5 segundos após iniciar o download
    },
    onError: (error: any) => {
      setProgressModal(prev => ({
        ...prev,
        progress: 0,
        status: 'error',
        message: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
      }));

      setTimeout(() => {
        setProgressModal(prev => ({ ...prev, isOpen: false }));
      }, 3000);
    },
  });

  const handleDownload = (download: Download) => {
    downloadMutation.mutate(download);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando downloads...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 relative">
        {/* Botões de navegação elegantes no canto superior direito */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
          <Button
            onClick={() => setLocation("/admin")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-full font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel
          </Button>
          <Button
            onClick={() => setLocation("/dashboard")}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-full font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Menu Principal
          </Button>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between pr-64">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Downloads</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie o histórico de versões e downloads do sistema
              </p>
            </div>
            
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setSelectedDownload(undefined)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Versão
                </Button>
              </DialogTrigger>
              <DownloadModal download={selectedDownload} onClose={handleCloseModal} />
            </Dialog>
          </div>

        <div className="grid gap-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total de Versões</CardTitle>
                <DownloadIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{downloads?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Versões Ativas</CardTitle>
                <DownloadIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {downloads?.filter(d => d.isActive).length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Versões Beta</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {downloads?.filter(d => d.isBeta).length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Sistema de Notificação</CardTitle>
                <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => testNotificationMutation.mutate()}
                  disabled={testNotificationMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  size="sm"
                >
                  {testNotificationMutation.isPending ? "Testando..." : "Testar Emails"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Downloads Table */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Histórico de Versões</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Gerencie todas as versões do software PROFAC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Versão</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Lançamento</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloads?.map((download) => (
                    <TableRow key={download.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{download.version}</span>
                          {download.isBeta && (
                            <Badge variant="secondary" className="text-xs">
                              Beta
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {download.fileName}
                      </TableCell>
                      <TableCell>{download.fileSize}</TableCell>
                      <TableCell>{formatDate(download.releaseDate)}</TableCell>
                      <TableCell>{download.downloadCount || 0}</TableCell>
                      <TableCell>
                        <Badge variant={download.isActive ? "default" : "secondary"}>
                          {download.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(download)}
                            disabled={downloadMutation.isPending}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(download)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a versão <strong>{download.version}</strong>?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(download)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {!downloads?.length && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhuma versão encontrada. Adicione a primeira versão do sistema.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Progress Modal */}
        <DownloadProgressModal
          isOpen={progressModal.isOpen}
          progress={progressModal.progress}
          status={progressModal.status}
          fileName={progressModal.fileName}
          message={progressModal.message}
          fileSize={progressModal.fileSize}
          downloadSpeed={progressModal.downloadSpeed}
          timeRemaining={progressModal.timeRemaining}
          onClose={() => setProgressModal(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </PageTransition>
  );
}