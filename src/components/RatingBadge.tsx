import { Star } from "lucide-react";

const RatingBadge = ({ rating }: { rating: number }) => {
  const color =
    rating >= 7 ? "text-green-400" : rating >= 5 ? "text-primary" : "text-destructive";

  return (
    <div className="flex items-center gap-1.5">
      <Star className={`h-5 w-5 fill-current ${color}`} />
      <span className={`font-display font-bold text-lg ${color}`}>
        {rating.toFixed(1)}
      </span>
      <span className="text-muted-foreground text-sm">/ 10</span>
    </div>
  );
};

export default RatingBadge;
