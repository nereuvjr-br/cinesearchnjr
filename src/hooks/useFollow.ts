import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { checkAndUpdateMissions } from "./useMissions";

export function useFollow(targetUserId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isFollowing } = useQuery({
    queryKey: ["follow", user?.id, targetUserId],
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user!.id)
        .eq("following_id", targetUserId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && user.id !== targetUserId,
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user!.id)
          .eq("following_id", targetUserId);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: user!.id, following_id: targetUserId });
        // Check follow missions
        const { count } = await supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", user!.id);
        await checkAndUpdateMissions(user!.id, "follow", count || 0);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  return { isFollowing: isFollowing ?? false, toggleFollow: () => toggleFollow.mutate() };
}

export function useFollowCounts(userId: string) {
  const { data: followers } = useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);
      return count || 0;
    },
  });

  const { data: following } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);
      return count || 0;
    },
  });

  return { followers: followers ?? 0, following: following ?? 0 };
}
