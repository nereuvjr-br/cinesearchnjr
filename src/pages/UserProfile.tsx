import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, Eye, Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFollow, useFollowCounts } from "@/hooks/useFollow";
import { useUserInteractionsById } from "@/hooks/useInteractions";
import { xpForNextLevel } from "@/lib/gamification";
import { searchMulti } from "@/lib/tmdb";
import Header from "@/components/Header";
import MediaCard from "@/components/MediaCard";
import CommentsSection from "@/components/CommentsSection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollow(id!);
  const { followers, following } = useFollowCounts(id!);

  const { data: profile } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: favorites } = useUserInteractionsById(id!, "favorite");
  const { data: watched } = useUserInteractionsById(id!, "watched");

  const { data: favItems } = useQuery({
    queryKey: ["fav-tmdb-user", id, favorites?.map((f: any) => f.tmdb_id)],
    queryFn: async () => {
      if (!favorites?.length) return [];
      const results = await Promise.all(
        favorites.slice(0, 12).map(async (f: any) => {
          const res = await searchMulti(f.tmdb_id.toString());
          return res.results.find((r: any) => r.id === f.tmdb_id) || null;
        })
      );
      return results.filter(Boolean);
    },
    enabled: !!favorites?.length,
  });

  const { data: watchedItems } = useQuery({
    queryKey: ["watched-tmdb-user", id, watched?.map((w: any) => w.tmdb_id)],
    queryFn: async () => {
      if (!watched?.length) return [];
      const results = await Promise.all(
        watched.slice(0, 12).map(async (w: any) => {
          const res = await searchMulti(w.tmdb_id.toString());
          return res.results.find((r: any) => r.id === w.tmdb_id) || null;
        })
      );
      return results.filter(Boolean);
    },
    enabled: !!watched?.length,
  });

  if (!profile) return null;

  const xpInfo = xpForNextLevel(profile.xp);
  const isMe = user?.id === id;

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
              <span className="text-sm text-muted-foreground">{profile.xp} XP</span>
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
              <Progress value={(xpInfo.current / xpInfo.needed) * 100} className="h-2" />
            </div>
          </div>
          {user && !isMe && (
            <Button variant={isFollowing ? "outline" : "default"} onClick={toggleFollow}>
              {isFollowing ? "Seguindo" : "Seguir"}
            </Button>
          )}
        </div>

        {/* Favorites */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Favoritos ({favorites?.length || 0})
            </h2>
          </div>
          {favItems?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favItems.map((item: any) => <MediaCard key={item.id} item={item} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum favorito.</p>
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
              {watchedItems.map((item: any) => <MediaCard key={item.id} item={item} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum item assistido.</p>
          )}
        </div>

        {/* Comments on profile */}
        <CommentsSection profileUserId={id} />
      </main>
    </div>
  );
};

export default UserProfile;
