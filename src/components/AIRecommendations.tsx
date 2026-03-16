import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserInteractions } from "@/hooks/useInteractions";
import { searchMulti, type TMDBSearchItem } from "@/lib/tmdb";
import MediaCard from "./MediaCard";

const AIRecommendations = () => {
  const { user } = useAuth();
  const { data: favorites } = useUserInteractions("favorite");
  const { data: watched } = useUserInteractions("watched");

  const allInteractions = [
    ...(favorites?.slice(0, 3) || []),
    ...(watched?.slice(0, 3) || []),
  ];

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["ai-recommendations", allInteractions.map((f) => f.tmdb_id)],
    queryFn: async () => {
      if (!allInteractions.length) return [];

      const titles = await Promise.all(
        allInteractions.map(async (f) => {
          const res = await searchMulti(f.tmdb_id.toString());
          const match = res.results.find((r: any) => r.id === f.tmdb_id);
          return match?.title || match?.name || null;
        })
      );
      const validTitles = titles.filter(Boolean);
      if (!validTitles.length) return [];

      const { data, error } = await supabase.functions.invoke("ai-recommendations", {
        body: { titles: validTitles },
      });
      if (error) throw error;

      const allIds = [...(favorites || []), ...(watched || [])].map((i) => i.tmdb_id);
      const suggestions: TMDBSearchItem[] = [];
      for (const title of data.recommendations || []) {
        const res = await searchMulti(title);
        const match = res.results.find(
          (r: any) => r.media_type !== "person" && !allIds.includes(r.id)
        );
        if (match) suggestions.push(match);
      }
      return suggestions.slice(0, 8);
    },
    enabled: !!user && allInteractions.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  if (!user || !allInteractions.length || (!isLoading && !recommendations?.length)) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg text-foreground">Sugestões da IA para Você</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          A IA está analisando seus gostos...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {recommendations?.map((item) => (
            <div key={item.id} className="shrink-0 w-40">
              <MediaCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
