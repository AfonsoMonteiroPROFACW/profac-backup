import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Comment, InsertComment } from "@shared/schema";

export function CommentsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["/api/comments"],
  });

  const commentMutation = useMutation({
    mutationFn: async (commentData: InsertComment) => {
      const response = await apiRequest("POST", "/api/comments", commentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi enviado e será analisado antes da publicação.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      setRating(0);
      setHoverRating(0);
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar comentário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const commentData: InsertComment = {
      userId: null,
      name: formData.get("name") as string,
      companyName: formData.get("companyName") as string,
      rating,
      content: formData.get("content") as string,
    };

    if (!commentData.name || !commentData.companyName || !commentData.content || rating === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos e selecione uma avaliação.",
        variant: "destructive",
      });
      return;
    }

    commentMutation.mutate(commentData);
    e.currentTarget.reset();
  };

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"
        } ${interactive ? "cursor-pointer" : ""}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      />
    ));
  };

  if (isLoading) {
    return (
      <section id="comments" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(210,79%,46%)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando comentários...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="comments" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Comentários dos Clientes</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Veja o que nossos clientes estão dizendo sobre o sistema PROFAC
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {(comments as Comment[]).map((comment: Comment) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="bg-[hsl(210,79%,46%)] text-white rounded-full w-12 h-12 flex items-center justify-center font-semibold">
                  {comment.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{comment.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{comment.companyName}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {renderStars(comment.rating)}
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Deixe seu comentário</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-900 dark:text-white">Nome</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Seu nome" 
                    required 
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName" className="text-gray-900 dark:text-white">Empresa</Label>
                  <Input 
                    id="companyName" 
                    name="companyName" 
                    placeholder="Nome da empresa" 
                    required 
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-900 dark:text-white">Avaliação</Label>
                <div className="flex space-x-1 mt-2">
                  {renderStars(hoverRating || rating, true)}
                </div>
              </div>
              <div>
                <Label htmlFor="content" className="text-gray-900 dark:text-white">Comentário</Label>
                <Textarea 
                  id="content" 
                  name="content" 
                  rows={4} 
                  placeholder="Compartilhe sua experiência com o PROFAC..."
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <Button 
                type="submit" 
                disabled={commentMutation.isPending}
                className="w-full bg-[hsl(210,79%,46%)] hover:bg-[hsl(210,79%,36%)]"
              >
                {commentMutation.isPending ? "Enviando..." : "Enviar Comentário"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
