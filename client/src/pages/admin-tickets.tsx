import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Ticket, Search, Filter, Plus, MessageCircle, Clock, AlertTriangle, CheckCircle, User, Mail, Phone, Calendar, Tag, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SupportTicket, TicketReply } from "@shared/schema";
import { useLocation } from "wouter";

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  waiting_customer: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
};

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  urgent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
};

const statusLabels = {
  open: "Aberto",
  in_progress: "Em Andamento",
  waiting_customer: "Aguardando Cliente",
  resolved: "Resolvido",
  closed: "Fechado"
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente"
};

const categoryLabels = {
  technical: "Técnico",
  billing: "Financeiro",
  general: "Geral",
  bug: "Bug",
  feature: "Funcionalidade"
};

interface TicketDetailModalProps {
  ticket: SupportTicket;
  replies: TicketReply[];
  onClose: () => void;
}

function TicketDetailModal({ ticket, replies, onClose }: TicketDetailModalProps) {
  const [newReply, setNewReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const { toast } = useToast();

  const replyMutation = useMutation({
    mutationFn: async (data: { content: string; isInternal: boolean }) => {
      const res = await apiRequest("POST", `/api/admin/tickets/${ticket.id}/replies`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets", ticket.id] });
      setNewReply("");
      toast({
        title: "Resposta adicionada",
        description: "A resposta foi adicionada ao ticket com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar resposta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PUT", `/api/admin/tickets/${ticket.id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets", ticket.id] });
      toast({
        title: "Status atualizado",
        description: "O status do ticket foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          {ticket.ticketNumber} - {ticket.title}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Ticket Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-900 dark:text-white">Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{ticket.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{ticket.customerEmail}</span>
              </div>
              {ticket.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.customerPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-900 dark:text-white">Status do Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                  {statusLabels[ticket.status as keyof typeof statusLabels]}
                </Badge>
                <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                  {priorityLabels[ticket.priority as keyof typeof priorityLabels]}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(ticket.createdAt!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{categoryLabels[ticket.category as keyof typeof categoryLabels]}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm">Descrição do Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
          </CardContent>
        </Card>

        {/* Status Update */}
        <div className="flex items-center gap-2">
          <Label htmlFor="status">Atualizar Status:</Label>
          <Select 
            value={ticket.status} 
            onValueChange={(value) => updateStatusMutation.mutate(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="waiting_customer">Aguardando Cliente</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Replies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Histórico de Respostas ({replies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {replies.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma resposta ainda.</p>
            ) : (
              replies.map((reply) => (
                <div 
                  key={reply.id} 
                  className={`p-3 rounded-lg border ${reply.isInternal ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800' : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={reply.isInternal ? "secondary" : "default"}>
                        {reply.isInternal ? "Nota Interna" : "Resposta"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(reply.createdAt!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))
            )}

            {/* New Reply Form */}
            <div className="space-y-3 pt-4 border-t">
              <Label htmlFor="reply">Nova Resposta</Label>
              <Textarea
                id="reply"
                placeholder="Digite sua resposta..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={4}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="internal"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                  />
                  <Label htmlFor="internal" className="text-sm">
                    Nota interna (não visível para o cliente)
                  </Label>
                </div>
                <Button
                  onClick={() => replyMutation.mutate({ content: newReply, isInternal })}
                  disabled={!newReply.trim() || replyMutation.isPending}
                >
                  {replyMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );
}

export default function AdminTicketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [, setLocation] = useLocation();
  const [selectedTicket, setSelectedTicket] = useState<{ ticket: SupportTicket; replies: TicketReply[] } | null>(null);
  const { toast } = useToast();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["/api/admin/tickets", { search: searchTerm, status: statusFilter !== "all" ? statusFilter : undefined, priority: priorityFilter !== "all" ? priorityFilter : undefined }],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const ticketDetailQuery = useQuery({
    queryKey: ["/api/admin/tickets", selectedTicket?.ticket.id],
    queryFn: async () => {
      if (!selectedTicket) return null;
      const res = await apiRequest("GET", `/api/admin/tickets/${selectedTicket.ticket.id}`);
      return await res.json();
    },
    enabled: !!selectedTicket,
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/tickets/${ticketId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({
        title: "Ticket excluído",
        description: "O ticket foi excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredTickets = (tickets as SupportTicket[])?.filter((ticket: SupportTicket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusCounts = (tickets as SupportTicket[])?.reduce((acc: Record<string, number>, ticket: SupportTicket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 relative">
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Tickets</h1>
          <p className="text-muted-foreground">Gerencie solicitações de suporte dos clientes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{(tickets as SupportTicket[])?.length || 0}</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abertos</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.open || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.in_progress || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.resolved || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, título, cliente ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="waiting_customer">Aguardando Cliente</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum ticket encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente ajustar os filtros de busca." : "Não há tickets de suporte no momento."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket: SupportTicket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{ticket.ticketNumber}</h3>
                      <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                        {statusLabels[ticket.status as keyof typeof statusLabels]}
                      </Badge>
                      <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                        {priorityLabels[ticket.priority as keyof typeof priorityLabels]}
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-2 text-gray-900 dark:text-white">{ticket.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{ticket.description.substring(0, 150)}...</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {ticket.customerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {ticket.customerEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(ticket.createdAt!), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {categoryLabels[ticket.category as keyof typeof categoryLabels]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTicket({ ticket, replies: [] })}
                        >
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      {selectedTicket && ticketDetailQuery.data && (
                        <TicketDetailModal
                          ticket={ticketDetailQuery.data.ticket}
                          replies={ticketDetailQuery.data.replies}
                          onClose={() => setSelectedTicket(null)}
                        />
                      )}
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTicketMutation.mutate(ticket.id)}
                      disabled={deleteTicketMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}