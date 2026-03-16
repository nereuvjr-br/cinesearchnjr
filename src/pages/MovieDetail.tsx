import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Clock, Calendar } from "lucide-react";
import { getMovie, imgUrl } from "@/lib/tmdb";
import RatingBadge from "@/components/RatingBadge";
import ProviderList from "@/components/ProviderList";
import InteractionButtons from "@/components/InteractionButtons";
import CommentsSection from "@/components/CommentsSection";
import { Button } from "@/components/ui/button";

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovie(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!movie) return null;

  const trailer = movie.videos.results.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  const providers = movie["watch/providers"]?.results?.BR;
  const backdrop = imgUrl(movie.backdrop_path, "original");
  const poster = imgUrl(movie.poster_path, "w500");

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
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
          {/* Poster */}
          {poster && (
            <div className="shrink-0 w-64 mx-auto md:mx-0">
              <img src={poster} alt={movie.title} className="w-full rounded-xl shadow-2xl" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-5">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{movie.title}</h1>
              <InteractionButtons tmdbId={movie.id} mediaType="movie" size="md" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <RatingBadge rating={movie.vote_average} />
              {movie.release_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(movie.release_date).getFullYear()}
                </span>
              )}
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}min
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((g) => (
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

            <div>
              <h2 className="font-display font-semibold text-foreground mb-2">Sinopse</h2>
              <p className="text-muted-foreground leading-relaxed">
                {movie.overview || "Sinopse não disponível."}
              </p>
            </div>

            <div>
              <h2 className="font-display font-semibold text-foreground mb-2">Onde assistir</h2>
              <ProviderList providers={providers} />
            </div>

            {/* Cast */}
            {movie.credits.cast.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-foreground mb-3">Elenco</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {movie.credits.cast.slice(0, 10).map((c) => (
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

export default MovieDetail;
