import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { searchMulti, getTrending } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import Header from "@/components/Header";
import AIRecommendations from "@/components/AIRecommendations";
import { useAuth } from "@/contexts/AuthContext";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const Index = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const { user } = useAuth();

  const { data: trending } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrending,
  });

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchMulti(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const items = debouncedQuery.length >= 2
    ? (searchResults?.results || []).filter((r) => r.media_type !== "person")
    : (trending?.results || []).filter((r) => r.media_type !== "person");

  return (
    <div className="min-h-screen">
      <Header query={query} onQueryChange={setQuery} />

      <main className="container mx-auto py-8 space-y-8">
        {/* AI Recommendations */}
        {user && debouncedQuery.length < 2 && <AIRecommendations />}

        <div>
          <div className="flex items-center gap-2 mb-6">
            {debouncedQuery.length >= 2 ? (
              <h2 className="font-display text-lg text-foreground">
                Resultados para <span className="text-primary">"{debouncedQuery}"</span>
                {isFetching && <span className="text-muted-foreground ml-2 text-sm">buscando...</span>}
              </h2>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg text-foreground">Em alta esta semana</h2>
              </div>
            )}
          </div>

          {items.length === 0 && debouncedQuery.length >= 2 && !isFetching && (
            <p className="text-muted-foreground text-center py-20">Nenhum resultado encontrado.</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item, i) => (
              <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
