import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { imgUrl, type TMDBSearchItem } from "@/lib/tmdb";
import InteractionButtons from "./InteractionButtons";

interface MediaCardProps {
  item: TMDBSearchItem;
}

const MediaCard = ({ item }: MediaCardProps) => {
  const title = item.title || item.name || "Sem título";
  const date = item.release_date || item.first_air_date;
  const year = date ? new Date(date).getFullYear() : null;
  const type = item.media_type === "movie" ? "movie" : "tv";
  const poster = imgUrl(item.poster_path, "w342");

  return (
    <Link
      to={`/${type}/${item.id}`}
      className="group block glass-card overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:glow-border relative"
    >
      <div className="aspect-[2/3] overflow-hidden bg-muted relative">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Sem imagem
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <InteractionButtons tmdbId={item.id} mediaType={type as "movie" | "tv"} />
        </div>
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2 text-foreground">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{year || "—"}</span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {item.vote_average.toFixed(1)}
          </span>
        </div>
        <span className="inline-block text-[10px] uppercase tracking-wider font-medium text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
          {item.media_type === "movie" ? "Filme" : "Série"}
        </span>
      </div>
    </Link>
  );
};

export default MediaCard;
