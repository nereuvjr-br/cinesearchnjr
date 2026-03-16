import { Link } from "react-router-dom";
import { Film, LogIn, User, Trophy, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  query?: string;
  onQueryChange?: (q: string) => void;
  showSearch?: boolean;
}

const Header = ({ query = "", onQueryChange, showSearch = true }: HeaderProps) => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto flex items-center gap-4 py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Film className="h-7 w-7 text-primary" />
          <span className="font-display font-bold text-xl text-gradient hidden sm:inline">CineSearch</span>
        </Link>

        {showSearch && onQueryChange && (
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar filmes e séries..."
              className="pl-10 bg-secondary border-border/50 focus:ring-primary/30"
            />
          </div>
        )}

        <div className="shrink-0 ml-auto flex items-center gap-2">
          <Link to="/ranking" className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Ranking">
            <Trophy className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          </Link>

          {user && (
            <Link to="/missions" className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Missões">
              <Target className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          )}

          {user ? (
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="flex items-center gap-2 glass-card px-3 py-1.5 transition-all group-hover:glow-border">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  {profile?.username || "Perfil"}
                </span>
                {profile && (
                  <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    Nv.{profile.level}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
