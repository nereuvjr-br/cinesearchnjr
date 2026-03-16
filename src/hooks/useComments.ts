import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { checkAndUpdateMissions } from "./useMissions";

interface CommentFilter {
  tmdbId?: number;
  mediaType?: string;
  profileUserId?: string;
}

export function useComments(filter: CommentFilter) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["comments", filter.tmdbId, filter.mediaType, filter.profileUserId];

  const { data: comments, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from("comments").select("*").order("created_at", { ascending: false });
      
      if (filter.tmdbId && filter.mediaType) {
        query = query.eq("tmdb_id", filter.tmdbId).eq("media_type", filter.mediaType);
      } else if (filter.profileUserId) {
        query = query.eq("profile_user_id", filter.profileUserId);
      }

      const { data } = await query;
      
      if (!data?.length) return [];

      // Fetch usernames for comments
      const userIds = [...new Set(data.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, level")
        .in("id", userIds);

      return data.map((c: any) => ({
        ...c,
        username: profiles?.find((p: any) => p.id === c.user_id)?.username || "Anônimo",
        user_level: profiles?.find((p: any) => p.id === c.user_id)?.level || 1,
      }));
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const insertData: any = { user_id: user!.id, content };
      if (filter.tmdbId && filter.mediaType) {
        insertData.tmdb_id = filter.tmdbId;
        insertData.media_type = filter.mediaType;
      } else if (filter.profileUserId) {
        insertData.profile_user_id = filter.profileUserId;
      }
      const { error } = await supabase.from("comments").insert(insertData);
      if (error) throw error;

      // Check comment missions
      const { count } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      await checkAndUpdateMissions(user!.id, "comment", count || 0);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      await supabase.from("comments").delete().eq("id", commentId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { comments: comments || [], isLoading, addComment, deleteComment };
}
