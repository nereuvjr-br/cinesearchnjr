import { useQuery } from "@tanstack/react-query";
import { Trophy, Users, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFollow, useFollowCounts } from "@/hooks/useFollow";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Ranking = () => {
  const { user } = useAuth();

  const { data: topUsers, isLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("xp", { ascending: false })
        .limit(50);

      if (!profiles?.length) return [];

      // Get follower counts for each user
      const enriched = await Promise.all(
        profiles.map(async (p: any) => {
          const { count: followers } = await supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("following_id", p.id);

          // Get completed missions count
          const { count: badges } = await supabase
            .from("user_missions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", p.id)
            .eq("completed", true);

          return { ...p, followers: followers || 0, badges: badges || 0 };
        })
      );

      return enriched;
    },
  });

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen">
      <Header showSearch={false} />

      <main className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">Ranking Global</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {topUsers?.map((u: any, i: number) => (
              <RankRow key={u.id} user={u} rank={i + 1} medal={medals[i]} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const RankRow = ({ user: u, rank, medal, currentUserId }: any) => {
  const { isFollowing, toggleFollow } = useFollow(u.id);
  const isMe = currentUserId === u.id;

  return (
    <div className={`glass-card p-4 flex items-center gap-4 transition-all ${isMe ? "border-primary/30 bg-primary/5" : ""}`}>
      <div className="w-8 text-center shrink-0">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
        )}
      </div>

      <Link to={`/user/${u.id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary font-display shrink-0">
          {(u.username || "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{u.username || "Anônimo"}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-bold text-primary">Nv.{u.level}</span>
            <span>{u.xp} XP</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {u.followers}
            </span>
            {u.badges > 0 && (
              <span className="flex items-center gap-1">
                <Medal className="h-3 w-3" /> {u.badges}
              </span>
            )}
          </div>
        </div>
      </Link>

      {currentUserId && !isMe && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={toggleFollow}
          className="shrink-0"
        >
          {isFollowing ? "Seguindo" : "Seguir"}
        </Button>
      )}
    </div>
  );
};

export default Ranking;
