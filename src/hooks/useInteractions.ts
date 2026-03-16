import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { updateXP, XP_FAVORITE, XP_WATCHED } from "@/lib/gamification";

export function useInteraction(tmdbId: number, mediaType: "movie" | "tv") {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = ["interaction", user?.id, tmdbId, mediaType];

  const { data: interaction } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_interactions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("tmdb_id", tmdbId)
        .eq("media_type", mediaType)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const upsert = useMutation({
    mutationFn: async (update: { is_favorite?: boolean; is_watched?: boolean }) => {
      const { data, error } = await supabase
        .from("user_interactions")
        .upsert(
          {
            user_id: user!.id,
            tmdb_id: tmdbId,
            media_type: mediaType,
            is_favorite: update.is_favorite ?? interaction?.is_favorite ?? false,
            is_watched: update.is_watched ?? interaction?.is_watched ?? false,
          },
          { onConflict: "user_id,tmdb_id,media_type" }
        )
        .select()
        .single();
      if (error) throw error;
      return { data, update };
    },
    onSuccess: async ({ update }) => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });

      if (update.is_favorite !== undefined) {
        await updateXP(user!.id, update.is_favorite ? XP_FAVORITE : -XP_FAVORITE);
        if (update.is_favorite) {
          const { checkAndUpdateMissions } = await import("./useMissions");
          const { count } = await supabase
            .from("user_interactions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id)
            .eq("is_favorite", true);
          await checkAndUpdateMissions(user!.id, "favorite", count || 0);
        }
      }
      if (update.is_watched !== undefined) {
        await updateXP(user!.id, update.is_watched ? XP_WATCHED : -XP_WATCHED);
        if (update.is_watched) {
          const { checkAndUpdateMissions } = await import("./useMissions");
          const { count } = await supabase
            .from("user_interactions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id)
            .eq("is_watched", true);
          await checkAndUpdateMissions(user!.id, "watched", count || 0);
        }
      }
    },
  });

  return {
    isFavorite: interaction?.is_favorite ?? false,
    isWatched: interaction?.is_watched ?? false,
    toggleFavorite: () => upsert.mutate({ is_favorite: !interaction?.is_favorite }),
    toggleWatched: () => upsert.mutate({ is_watched: !interaction?.is_watched }),
    isLoading: upsert.isPending,
  };
}

export function useUserInteractions(type: "favorite" | "watched") {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["interactions", user?.id, type],
    queryFn: async () => {
      const column = type === "favorite" ? "is_favorite" : "is_watched";
      const { data } = await supabase
        .from("user_interactions")
        .select("*")
        .eq("user_id", user!.id)
        .eq(column, true);
      return data || [];
    },
    enabled: !!user,
  });
}

export function useUserInteractionsById(userId: string, type: "favorite" | "watched") {
  return useQuery({
    queryKey: ["interactions", userId, type],
    queryFn: async () => {
      const column = type === "favorite" ? "is_favorite" : "is_watched";
      const { data } = await supabase
        .from("user_interactions")
        .select("*")
        .eq("user_id", userId)
        .eq(column, true);
      return data || [];
    },
    enabled: !!userId,
  });
}
