import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Calendar, Tv, Info, ChevronDown, ChevronUp } from "lucide-react";
import { getTVShow, getTVSeason, imgUrl } from "@/lib/tmdb";
import RatingBadge from "@/components/RatingBadge";
import ProviderList from "@/components/ProviderList";
import InteractionButtons from "@/components/InteractionButtons";
import { Button } from "@/components/ui/button";

const TVDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  const { data: show, isLoading } = useQuery({
    queryKey: ["tv", id],
    queryFn: () => getTVShow(Number(id)),
    enabled: !!id,
  });

  const { data: seasonData } = useQuery({
    queryKey: ["tv", id, "season", selectedSeason],
    queryFn: () => getTVSeason(Number(id), selectedSeason!),
    enabled: selectedSeason !== null,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!show) return null;

  const trailer = show.videos.results.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  const providers = show["watch/providers"]?.results?.BR;
  const backdrop = imgUrl(show.backdrop_path, "original");
  const poster = imgUrl(show.poster_path, "w500");

  const statusMap: Record<string, string> = {
    "Returning Series": "Em produção",
    Ended: "Finalizada",
    Canceled: "Cancelada",
    "In Production": "Em produção",
  };

  return (
    <div className="min-h-screen">
      {backdrop && (
        <div className="fixed inset-0 -z-10">
          <img src={backdrop} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40" />
        </div>
      )}

      <div className="container mx-auto py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {poster && (
            <div className="shrink-0 w-64 mx-auto md:mx-0">
              <img src={poster} alt={show.name} className="w-full rounded-xl shadow-2xl" />
            </div>
          )}

          <div className="flex-1 space-y-5">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{show.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <RatingBadge rating={show.vote_average} />
              {show.first_air_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(show.first_air_date).getFullYear()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Tv className="h-4 w-4" />
                {show.number_of_seasons} temp. · {show.number_of_episodes} ep.
              </span>
              <span className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                {statusMap[show.status] || show.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {show.genres.map((g) => (
                <span key={g.id} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {g.name}
                </span>
              ))}
            </div>

            {trailer && (
              <Button asChild>
                <a href={`https://youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer">
                  <Play className="h-4 w-4" />
                  Assistir Trailer
                </a>
              </Button>
            )}

            {show.next_episode_to_air && (
              <div className="glass-card p-4">
                <h3 className="font-display font-semibold text-sm text-primary mb-1">Próximo Episódio</h3>
                <p className="text-foreground text-sm">
                  S{show.next_episode_to_air.season_number}E{show.next_episode_to_air.episode_number} — {show.next_episode_to_air.name}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {new Date(show.next_episode_to_air.air_date).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}

            <div>
              <h2 className="font-display font-semibold text-foreground mb-2">Sinopse</h2>
              <p className="text-muted-foreground leading-relaxed">
                {show.overview || "Sinopse não disponível."}
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-foreground mb-2">Onde assistir</h2>
              <ProviderList providers={providers} />
            </div>

            {/* Seasons */}
            <div>
              <h2 className="font-display font-semibold text-foreground mb-3">Temporadas</h2>
              <div className="space-y-2">
                {show.seasons
                  .filter((s) => s.season_number > 0)
                  .map((season) => (
                    <div key={season.id} className="glass-card overflow-hidden">
                      <button
                        onClick={() =>
                          setSelectedSeason(
                            selectedSeason === season.season_number ? null : season.season_number
                          )
                        }
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors"
                      >
                        <div>
                          <span className="font-medium text-sm text-foreground">{season.name}</span>
                          <span className="text-muted-foreground text-xs ml-2">
                            {season.episode_count} episódios
                          </span>
                        </div>
                        {selectedSeason === season.season_number ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {selectedSeason === season.season_number && seasonData && (
                        <div className="border-t border-border/50 divide-y divide-border/30">
                          {seasonData.episodes.map((ep) => (
                            <div key={ep.id} className="flex gap-3 p-3">
                              <div className="shrink-0 w-28 h-16 rounded-md overflow-hidden bg-muted">
                                {ep.still_path ? (
                                  <img
                                    src={imgUrl(ep.still_path, "w300")!}
                                    alt={ep.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    Ep {ep.episode_number}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {ep.episode_number}. {ep.name}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                  {ep.overview || "Sem descrição."}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {ep.air_date && new Date(ep.air_date).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Cast */}
            {show.credits.cast.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-foreground mb-3">Elenco</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {show.credits.cast.slice(0, 10).map((c) => (
                    <div key={c.id} className="shrink-0 w-20 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted mb-1">
                        {c.profile_path ? (
                          <img src={imgUrl(c.profile_path, "w185")!} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">?</div>
                        )}
                      </div>
                      <p className="text-xs text-foreground font-medium truncate">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{c.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="container mx-auto py-20 flex justify-center">
    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default TVDetail;
