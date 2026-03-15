import { Heart, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInteraction } from "@/hooks/useInteractions";
import { cn } from "@/lib/utils";

interface InteractionButtonsProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  size?: "sm" | "md";
}

const InteractionButtons = ({ tmdbId, mediaType, size = "sm" }: InteractionButtonsProps) => {
  const { user } = useAuth();
  const { isFavorite, isWatched, toggleFavorite, toggleWatched, isLoading } = useInteraction(tmdbId, mediaType);

  if (!user) return null;

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnClass = size === "sm"
    ? "p-1.5 rounded-full backdrop-blur-sm transition-all"
    : "p-2 rounded-full backdrop-blur-sm transition-all";

  return (
    <div className="flex gap-1.5" onClick={(e) => e.preventDefault()}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(); }}
        disabled={isLoading}
        className={cn(btnClass, "bg-background/60 hover:bg-background/90", isFavorite && "bg-red-500/20")}
        title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart className={cn(iconSize, isFavorite ? "fill-red-500 text-red-500" : "text-foreground")} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWatched(); }}
        disabled={isLoading}
        className={cn(btnClass, "bg-background/60 hover:bg-background/90", isWatched && "bg-primary/20")}
        title={isWatched ? "Remover dos assistidos" : "Marcar como assistido"}
      >
        <Eye className={cn(iconSize, isWatched ? "fill-primary text-primary" : "text-foreground")} />
      </button>
    </div>
  );
};

export default InteractionButtons;
