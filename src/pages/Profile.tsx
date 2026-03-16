import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Heart, Eye, Trophy, Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { xpForNextLevel } from "@/lib/gamification";
import { searchMulti } from "@/lib/tmdb";
import { useUserInteractions } from "@/hooks/useInteractions";
import { useFollowCounts } from "@/hooks/useFollow";
import Header from "@/components/Header";
import MediaCard from "@/components/MediaCard";
import MissionsPanel from "@/components/MissionsPanel";
import CommentsSection from "@/components/CommentsSection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const GENRE_BADGES: Record<number, { name: string; label: string }> = {
  28: { name: "action", label: "🎬 Fã de Ação" },
  35: { name: "comedy", label: "😂 Fã de Comédia" },
  27: { name: "horror", label: "👻 Fã de Terror" },
  878: { name: "scifi", label: "🚀 Fã de Sci-Fi" },
  10749: { name: "romance", label: "💕 Fã de Romance" },
  18: { name: "drama", label: "🎭 Fã de Drama" },
  16: { name: "animation", label: "✨ Fã de Animação" },
  53: { name: "thriller", label: "🔪 Fã de Thriller" },
};

const Profile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { followers, following } = useFollowCounts(user?.id || "");
  const { data: favorites } = useUserInteractions("favorite");
  const { data: watched } = useUserInteractions("watched");

  const { data: favItems } = useQuery({
    queryKey: ["fav-tmdb", favorites?.map((f) => f.tmdb_id)],
    queryFn: async () => {
      if (!favorites?.length) return [];
      const results = await Promise.all(
        favorites.map(async (f) => {
          const res = await searchMulti(f.tmdb_id.toString());
          return res.results.find((r: any) => r.id === f.tmdb_id) || null;
        })
      );
      return results.filter(Boolean);
    },
    enabled: !!favorites?.length,
  });

  const { data: watchedItems } = useQuery({
    queryKey: ["watched-tmdb", watched?.map((w) => w.tmdb_id)],
    queryFn: async () => {
      if (!watched?.length) return [];
      const results = await Promise.all(
        watched.map(async (w) => {
          const res = await searchMulti(w.tmdb_id.toString());
          return res.results.find((r: any) => r.id === w.tmdb_id) || null;
        })
      );
      return results.filter(Boolean);
    },
    enabled: !!watched?.length,
  });

  const genreCounts: Record<number, number> = {};
  watchedItems?.forEach((item: any) => {
    item.genre_ids?.forEach((gid: number) => {
      genreCounts[gid] = (genreCounts[gid] || 0) + 1;
    });
  });
  const earnedBadges = Object.entries(GENRE_BADGES).filter(
    ([gid]) => (genreCounts[Number(gid)] || 0) >= 5
  );

  if (!user || !profile) return null;

  const xpInfo = xpForNextLevel(profile.xp);

  return (
    <div className="min-h-screen">
      <Header showSearch={false} />

      <main className="container mx-auto py-8 space-y-8">
        {/* Profile header */}
        <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary font-display">
            {(profile.username || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h1 className="font-display text-2xl font-bold text-foreground">{profile.username}</h1>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <span className="text-sm font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                Nível {profile.level}
              </span>
              <span className="text-sm text-muted-foreground">{profile.xp} XP total</span>
            </div>
            <div className="flex items-center gap-4 justify-center sm:justify-start text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {followers} seguidores
              </span>
              <span className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" /> {following} seguindo
              </span>
            </div>
            <div className="max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{xpInfo.current} / {xpInfo.needed} XP</span>
                <span>Próximo nível</span>
              </div>
              <Progress value={(xpInfo.current / xpInfo.needed) * 100} className="h-2" />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>

        {/* Achievements */}
        {earnedBadges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Conquistas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map(([, badge]) => (
                <span key={badge.name} className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missions */}
        <MissionsPanel />

        {/* Favorites */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-destructive" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Favoritos ({favorites?.length || 0})
            </h2>
          </div>
          {favItems?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favItems.map((item: any) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum favorito ainda.</p>
          )}
        </div>

        {/* Watched */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Assistidos ({watched?.length || 0})
            </h2>
          </div>
          {watchedItems?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {watchedItems.map((item: any) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum item assistido ainda.</p>
          )}
        </div>

        {/* Profile comments */}
        <CommentsSection profileUserId={user.id} />
      </main>
    </div>
  );
};

export default Profile;
