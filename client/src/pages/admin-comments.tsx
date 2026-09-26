import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Star, 
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Home,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Comment, InsertComment } from "@shared/schema";
import { insertCommentSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const commentFormSchema = insertCommentSchema.extend({
  rating: z.coerce.number().min(1).max(5),
});

type CommentFormData = z.infer<typeof commentFormSchema>;

export default function AdminComments() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments based on tab and search
  const { data: comments = [], isLoading, error } = useQuery<Comment[]>({
    queryKey: ['/api/admin/comments', selectedTab, searchQuery],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (selectedTab !== 'all') {
          params.append('status', selectedTab);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        const url = `/api/admin/comments${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Form for creating/editing comments
  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      name: "" as any,
      companyName: "" as any,
      content: "" as any,
      rating: 5 as any,
      position: 0 as any,
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: CommentFormData) => {
      try {
        const response = await fetch('/api/admin/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ title: "Sucesso", description: "Comentário criado com sucesso!" });
    },
    onError: (error) => {
      console.error('Create comment mutation error:', error);
      toast({ title: "Erro", description: "Falha ao criar comentário.", variant: "destructive" });
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CommentFormData> }) => {
      try {
        const response = await fetch(`/api/admin/comments/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error updating comment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      setIsEditDialogOpen(false);
      setEditingComment(null);
      form.reset();
      toast({ title: "Sucesso", description: "Comentário atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar comentário.", variant: "destructive" });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      toast({ title: "Sucesso", description: "Comentário excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao excluir comentário.", variant: "destructive" });
    },
  });

  // Approve comment mutation
  const approveCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/comments/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      toast({ title: "Sucesso", description: "Comentário aprovado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao aprovar comentário.", variant: "destructive" });
    },
  });

  // Renew comment mutation
  const renewCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/comments/${id}/renew`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      toast({ title: "Sucesso", description: "Comentário renovado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao renovar comentário.", variant: "destructive" });
    },
  });

  // Update position mutation
  const updatePositionMutation = useMutation({
    mutationFn: async ({ id, position }: { id: number; position: number }) => {
      const response = await fetch(`/api/admin/comments/${id}/position`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ position }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      toast({ title: "Sucesso", description: "Posição atualizada com sucesso!" });
    },
  });

  const handleCreateComment = (data: CommentFormData) => {
    createCommentMutation.mutate(data);
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    form.reset({
      name: comment.name,
      companyName: comment.companyName,
      content: comment.content,
      rating: comment.rating,
      position: comment.position || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateComment = (data: CommentFormData) => {
    if (editingComment) {
      updateCommentMutation.mutate({ id: editingComment.id, data });
    }
  };

  const handleDeleteComment = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este comentário?")) {
      deleteCommentMutation.mutate(id);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with navigation buttons aligned right */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Gerenciar Comentários
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administre comentários de clientes e depoimentos
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => window.location.href = '/admin'} 
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm px-4 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Painel
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-sm px-4 py-2"
            >
              <Home className="h-4 w-4" />
              Menu Principal
            </Button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar comentários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)] whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                Novo Comentário
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Comentário</DialogTitle>
                <DialogDescription>
                  Adicione um novo comentário ou depoimento de cliente
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleCreateComment)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Cliente</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Empresa</Label>
                    <Input
                      id="companyName"
                      {...form.register("companyName")}
                      placeholder="Ex: Empresa ABC Ltda"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Avaliação</Label>
                    <Select onValueChange={(value) => form.setValue("rating", parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a avaliação" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} Estrela{rating > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">Posição</Label>
                    <Input
                      id="position"
                      type="number"
                      {...form.register("position", { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">Comentário</Label>
                  <Textarea
                    id="content"
                    {...form.register("content")}
                    placeholder="Digite o comentário do cliente..."
                    rows={4}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createCommentMutation.isPending}>
                    {createCommentMutation.isPending ? "Criando..." : "Criar Comentário"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(210,79%,46%)] mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando comentários...</p>
              </div>
            ) : comments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhum comentário encontrado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedTab === 'pending' ? 'Não há comentários pendentes de aprovação.' :
                     selectedTab === 'approved' ? 'Não há comentários aprovados.' :
                     'Não há comentários cadastrados.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {comments.map((comment) => (
                  <Card key={comment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <CardTitle className="text-lg">{comment.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              {comment.companyName}
                              {renderStars(comment.rating)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={comment.isApproved ? "default" : "secondary"}>
                            {comment.isApproved ? "Aprovado" : "Pendente"}
                          </Badge>
                          {comment.isRenewed && (
                            <Badge variant="outline">Renovado</Badge>
                          )}
                          {comment.position && (
                            <Badge variant="outline">Pos: {comment.position}</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {comment.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Criado em {formatDate(comment.createdAt)}
                          {comment.approvedAt && (
                            <span className="ml-2">
                              • Aprovado em {formatDate(comment.approvedAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!comment.isApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveCommentMutation.mutate(comment.id)}
                              disabled={approveCommentMutation.isPending}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => renewCommentMutation.mutate(comment.id)}
                            disabled={renewCommentMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Renovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditComment(comment)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Comentário</DialogTitle>
              <DialogDescription>
                Edite as informações do comentário
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleUpdateComment)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nome do Cliente</Label>
                  <Input
                    id="edit-name"
                    {...form.register("name")}
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-companyName">Empresa</Label>
                  <Input
                    id="edit-companyName"
                    {...form.register("companyName")}
                    placeholder="Ex: Empresa ABC Ltda"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-rating">Avaliação</Label>
                  <Select onValueChange={(value) => form.setValue("rating", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a avaliação" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Estrela{rating > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-position">Posição</Label>
                  <Input
                    id="edit-position"
                    type="number"
                    {...form.register("position", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-content">Comentário</Label>
                <Textarea
                  id="edit-content"
                  {...form.register("content")}
                  placeholder="Digite o comentário do cliente..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateCommentMutation.isPending}>
                  {updateCommentMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}