import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ModalTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, ArrowLeft, Plus, Eye, TrendingUp, Users, Clock, CheckCircle, MousePointer, RefreshCw, FileText, Image, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { InviteImageGenerator } from "@/components/invite-image-generator";

interface EmailInvitation {
  id: number;
  email: string;
  inviteToken: string;
  sentBy: number;
  status: "sent" | "clicked" | "registered" | "expired";
  clickCount: number;
  firstClickedAt?: string;
  lastClickedAt?: string;
  registeredAt?: string;
  registeredUserId?: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface InvitationStats {
  total: number;
  sent: number;
  clicked: number;
  registered: number;
  expired: number;
  conversionRate: number;
  clickRate: number;
}

// Schema para formulário de convite
const inviteSchema = z.object({
  emails: z.string().min(1, "Pelo menos um email é obrigatório"),
  customMessage: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function AdminInvitations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  
  const { user, isAuthenticated, isSuperAdmin } = useAuth();

  // Verificar se o usuário tem acesso de super admin  
  if (!isAuthenticated || !isSuperAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5 text-red-500" />
              Acesso Restrito
            </CardTitle>
            <CardDescription>
              Esta funcionalidade está disponível apenas para o super administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation("/dashboard")} variant="outline">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: invitations = [], isLoading: loadingInvitations } = useQuery<EmailInvitation[]>({
    queryKey: ["/api/admin/invitations"],
  });

  const { data: stats } = useQuery<InvitationStats>({
    queryKey: ["/api/admin/invitations/stats"],
  });

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      emails: "",
      customMessage: "",
    },
  });

  const sendInvitationMutation = useMutation({
    mutationFn: async (data: InviteFormData) => {
      const emails = data.emails.split(/[,\n]/).map(email => email.trim()).filter(Boolean);
      const response = await apiRequest("POST", "/api/admin/invitations/send", {
        emails,
        customMessage: data.customMessage
      });
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations/stats"] });
      toast({
        title: "Convites enviados",
        description: `${result.successCount} convites enviados com sucesso!`,
      });
      setShowInviteModal(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar convites",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", `/api/admin/invitations/resend/${encodeURIComponent(email)}`);
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations/stats"] });
      toast({
        title: "Convite reenviado",
        description: result.message || "Convite reenviado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Mail className="w-3 h-3 mr-1" />Enviado</Badge>;
      case "clicked":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><MousePointer className="w-3 h-3 mr-1" />Clicado</Badge>;
      case "registered":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Registrado</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200"><Clock className="w-3 h-3 mr-1" />Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const onSubmit = (data: InviteFormData) => {
    sendInvitationMutation.mutate(data);
  };

  

  

  if (loadingInvitations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(210,79%,46%)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 relative">
      {/* Botão de navegação elegante no canto superior direito */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          onClick={() => setLocation("/admin")}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-full font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Painel
        </Button>
      </div>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
              <Mail className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Email Convite</h1>
              <p className="text-gray-600 dark:text-gray-400">Convide novos usuários e acompanhe conversões</p>
            </div>
          </div>
        </div>

        

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enviados</CardTitle>
                <Mail className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Convites enviados</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Cliques</CardTitle>
                <MousePointer className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.clickRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{stats.clicked} clicaram</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversão</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.conversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{stats.registered} se registraram</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expirados</CardTitle>
                <Clock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.expired}</div>
                <p className="text-xs text-muted-foreground">Convites vencidos</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions and Table */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Histórico de Convites</CardTitle>
                <CardDescription>
                  Acompanhe todos os convites enviados e seu status
                </CardDescription>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-lg font-medium">
                      <Plus className="h-5 w-5 mr-2" />
                      Enviar Novo Convite
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <ModalTransition>
                      <DialogHeader>
                        <DialogTitle>Enviar Convites por Email</DialogTitle>
                        <DialogDescription>
                          Digite os emails separados por vírgula ou quebra de linha
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="emails"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emails dos Convidados</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="email1@exemplo.com, email2@exemplo.com&#10;email3@exemplo.com"
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="customMessage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mensagem Personalizada (Opcional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Adicione uma mensagem personalizada ao convite..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit" disabled={sendInvitationMutation.isPending}>
                              {sendInvitationMutation.isPending ? "Enviando..." : "Enviar Convites"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </ModalTransition>
                  </DialogContent>
                </Dialog>
                
                
                
                <Dialog open={showImageGenerator} onOpenChange={setShowImageGenerator}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-lg font-medium"
                    >
                      <Image className="h-5 w-5 mr-2" />
                      Imagem Futurista
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <ModalTransition>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Image className="h-5 w-5" />
                          Gerar Convite em Imagem
                        </DialogTitle>
                        <DialogDescription>
                          Escolha entre estilo moderno (futurista com cores) ou formal (tradicional e elegante)
                        </DialogDescription>
                      </DialogHeader>
                      
                      <InviteImageGenerator 
                        onGenerate={(format) => {
                          toast({
                            title: `Convite ${format.toUpperCase()} gerado`,
                            description: `Download iniciado automaticamente`,
                          });
                        }}
                      />
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowImageGenerator(false)}>
                          Fechar
                        </Button>
                      </DialogFooter>
                    </ModalTransition>
                  </DialogContent>
                </Dialog>

                
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cliques</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead>Primeiro Clique</TableHead>
                  <TableHead>Registrado em</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invitation.clickCount}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                    <TableCell>
                      {invitation.firstClickedAt ? formatDate(invitation.firstClickedAt) : "-"}
                    </TableCell>
                    <TableCell>
                      {invitation.registeredAt ? formatDate(invitation.registeredAt) : "-"}
                    </TableCell>
                    <TableCell>
                      <span className={new Date(invitation.expiresAt) < new Date() ? "text-red-600" : ""}>
                        {formatDate(invitation.expiresAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resendInvitationMutation.mutate(invitation.email)}
                        disabled={resendInvitationMutation.isPending || invitation.status === 'registered'}
                        className="h-8 px-3"
                      >
                        <RefreshCw className={`h-3 w-3 mr-1 ${resendInvitationMutation.isPending ? 'animate-spin' : ''}`} />
                        Reenviar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {invitations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum convite enviado ainda. Clique em "Enviar Convites" para começar!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}