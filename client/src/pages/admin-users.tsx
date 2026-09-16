import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ModalTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Clock, Shield, Trash2, Edit, ArrowLeft, Key, X, Mail, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, UpdateUser, UpdatePassword, updateUserSchema, updatePasswordSchema } from "@shared/schema";
import { formatDate, formatCurrency } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";


// Componente para editar usuário
function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(true);

  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user.fullName,
      cnpj: user.cnpj || "",
      companyName: user.companyName || "",
      phone: user.phone || "",
      status: user.status as "pending" | "approved" | "blocked",
      role: user.role as "user" | "admin",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: UpdateUser) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${user.id}`, userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário atualizado",
        description: "Os dados do usuário foram atualizados com sucesso.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const onSubmit = (data: UpdateUser) => {
    updateUserMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <ModalTransition>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário abaixo.
            </DialogDescription>
          </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="00.000.000/0000-00"
                        className="font-mono"
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="blocked">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </ModalTransition>
      </DialogContent>
    </Dialog>
  );
}

// Componente para solicitar redefinição de senha
function ResetPasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(true);

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/admin/users/${user.id}/require-password-change`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Redefinição de senha solicitada",
        description: `${user.fullName} será solicitado a alterar a senha no próximo login.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao solicitar redefinição",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleConfirm = () => {
    resetPasswordMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <ModalTransition>
          <DialogHeader>
            <DialogTitle>Solicitar Redefinição de Senha</DialogTitle>
            <DialogDescription>
              O usuário <strong>{user.fullName}</strong> será solicitado a alterar sua senha no próximo login.
            </DialogDescription>
          </DialogHeader>
        
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Esta ação não altera a senha imediatamente. O usuário receberá uma solicitação para 
              criar uma nova senha quando acessar o sistema novamente.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending ? "Processando..." : "Solicitar Redefinição"}
            </Button>
          </DialogFooter>
        </ModalTransition>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "blocked">("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "cnpj" | "company" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { user, isAuthenticated, isSuperAdmin, logoutMutation } = useAuth();

  // Verificar se o usuário tem acesso de super admin  
  if (!isAuthenticated || !isSuperAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
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

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: pendingUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users/pending"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/pending"] });
      toast({
        title: "Status atualizado",
        description: "Status do usuário foi atualizado com sucesso.",
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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário excluído",
        description: "Usuário foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendWelcomeEmailMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/send-welcome-email`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "Email de boas-vindas enviado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case "blocked":
        return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600"><XCircle className="w-3 h-3 mr-1" />Bloqueado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case "user":
        return <Badge variant="outline">Usuário</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  // Função para filtrar usuários
  const filteredUsers = users.filter(user => {
    const statusMatch = filter === "all" ? true : user.status === filter;
    const companyMatch = companyFilter === "all" ? true : user.companyName === companyFilter;
    return statusMatch && companyMatch;
  })
    .sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "name":
          compareValue = a.fullName.localeCompare(b.fullName);
          break;
        case "cnpj":
          compareValue = (a.cnpj || "").localeCompare(b.cnpj || "");
          break;
        case "company":
          compareValue = (a.companyName || "").localeCompare(b.companyName || "");
          break;
        case "date":
          compareValue = new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
          break;
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  const handleSort = (column: "name" | "cnpj" | "company" | "date") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleStatusChange = (userId: number, newStatus: string) => {
    updateStatusMutation.mutate({ userId, status: newStatus });
  };

  const handleDeleteUser = (userId: number) => {
    deleteUserMutation.mutate(userId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(210,79%,46%)]"></div>
      </div>
    );
  }

  return (
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
        <Button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-full font-medium"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestão de Usuários
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie usuários, aprove solicitações e controle acessos
            </p>
          </div>
        </div>

        {/* Stats Cards como Filtros */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg ${
                filter === "all" 
                  ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-600" 
                  : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setFilter("all")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Clique para ver todos</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg ${
                filter === "pending" 
                  ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-600" 
                  : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setFilter("pending")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {users.filter(u => u.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg ${
                filter === "approved" 
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-600" 
                  : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setFilter("approved")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {users.filter(u => u.status === "approved").length}
                </div>
                <p className="text-xs text-muted-foreground">Usuários ativos</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg ${
                filter === "blocked" 
                  ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-600" 
                  : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setFilter("blocked")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
                <X className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {users.filter(u => u.status === "blocked").length}
                </div>
                <p className="text-xs text-muted-foreground">Acesso negado</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Obter lista única de empresas para o dropdown */}
        {(() => {
          const uniqueCompanies = Array.from(new Set(users.map(u => u.companyName).filter(Boolean)));
          return null;
        })()}

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os usuários do sistema
                </CardDescription>
              </div>
              
              {/* Dropdown para filtrar por empresa */}
              <div className="flex items-center gap-4">
                <div className="min-w-[200px]">
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as empresas</SelectItem>
                      {Array.from(new Set(users.map(u => u.companyName).filter(Boolean))).map(company => (
                        <SelectItem key={company} value={company!}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">
                      <Button 
                        variant="ghost" 
                        className="p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("name")}
                      >
                        Usuário
                        {sortBy === "name" && (
                          sortOrder === "asc" ? " ↑" : " ↓"
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[140px] whitespace-nowrap">
                      <Button 
                        variant="ghost" 
                        className="p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("cnpj")}
                      >
                        CNPJ
                        {sortBy === "cnpj" && (
                          sortOrder === "asc" ? " ↑" : " ↓"
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[160px]">
                      <Button 
                        variant="ghost" 
                        className="p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("company")}
                      >
                        Empresa
                        {sortBy === "company" && (
                          sortOrder === "asc" ? " ↑" : " ↓"
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[80px] text-left">Perfil</TableHead>
                    <TableHead className="w-[80px] text-left">Status</TableHead>
                    <TableHead className="w-[120px] text-left">Último Acesso</TableHead>
                    <TableHead className="w-[60px] text-left">Acessos</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
              {filteredUsers.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{user.fullName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">
                        Cadastrado em {formatDate(user.createdAt!)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-mono whitespace-nowrap min-w-[140px]">
                      {user.cnpj ? user.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.companyName || "-"}</TableCell>
                  <TableCell className="text-left">{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-left">{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-left">
                    {user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}
                  </TableCell>
                  <TableCell className="text-left">{user.loginCount || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingUser(user)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                        title="Editar usuário"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      {/* Botão para enviar email de boas-vindas manualmente */}
                      {user.status === "approved" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => sendWelcomeEmailMutation.mutate(user.id)}
                          disabled={sendWelcomeEmailMutation.isPending}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                          title="Enviar email de boas-vindas"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {/* Password reset temporarily disabled to prevent corruption */}
                      {false && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setResettingPasswordUser(user)}
                          className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                          title="Redefinir senha"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                      )}

                      {user.role !== "admin" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário "{user.fullName}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário encontrado para os filtros selecionados.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de edição */}
        {editingUser && (
          <EditUserModal 
            user={editingUser} 
            onClose={() => setEditingUser(null)} 
          />
        )}
        
        {/* Modal de redefinição de senha */}
        {resettingPasswordUser && (
          <ResetPasswordModal 
            user={resettingPasswordUser} 
            onClose={() => setResettingPasswordUser(null)} 
          />
        )}

        
      </div>
    </div>
  );
}