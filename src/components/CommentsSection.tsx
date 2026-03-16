import { useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useComments } from "@/hooks/useComments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface CommentsSectionProps {
  tmdbId?: number;
  mediaType?: string;
  profileUserId?: string;
}

const CommentsSection = ({ tmdbId, mediaType, profileUserId }: CommentsSectionProps) => {
  const { user } = useAuth();
  const { comments, addComment, deleteComment } = useComments({ tmdbId, mediaType, profileUserId });
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment.mutate(text.trim());
    setText("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">
          Comentários ({comments.length})
        </h3>
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva um comentário..."
            className="bg-secondary border-border/50"
          />
          <Button type="submit" size="sm" disabled={addComment.isPending || !text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {comments.map((c: any) => (
          <div key={c.id} className="glass-card p-3 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link to={`/user/${c.user_id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  {c.username}
                </Link>
                <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  Nv.{c.user_level}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("pt-BR")}
                </span>
                {user?.id === c.user_id && (
                  <button onClick={() => deleteComment.mutate(c.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
