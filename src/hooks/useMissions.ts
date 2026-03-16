import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { updateXP } from "@/lib/gamification";
import { toast } from "sonner";

export function useMissions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: missions } = useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data } = await supabase.from("missions").select("*");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: userMissions } = useQuery({
    queryKey: ["user-missions", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_missions")
        .select("*")
        .eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const assignMission = useMutation({
    mutationFn: async (missionId: string) => {
      const { error } = await supabase
        .from("user_missions")
        .upsert({ user_id: user!.id, mission_id: missionId, progress: 0 }, { onConflict: "user_id,mission_id" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-missions"] }),
  });

  return { missions, userMissions, assignMission };
}

export async function checkAndUpdateMissions(userId: string, actionType: string, count?: number) {
  // Get all missions and user progress
  const { data: missions } = await supabase.from("missions").select("*");
  const { data: userMissions } = await supabase
    .from("user_missions")
    .select("*")
    .eq("user_id", userId);

  if (!missions) return;

  for (const mission of missions) {
    if (mission.target_type !== actionType) continue;

    const userMission = userMissions?.find((um: any) => um.mission_id === mission.id);
    
    if (userMission?.completed) continue;

    const newProgress = count ?? (userMission ? userMission.progress + 1 : 1);
    const completed = newProgress >= mission.target_count;

    await supabase
      .from("user_missions")
      .upsert({
        user_id: userId,
        mission_id: mission.id,
        progress: Math.min(newProgress, mission.target_count),
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      }, { onConflict: "user_id,mission_id" });

    if (completed && !userMission?.completed) {
      await updateXP(userId, mission.xp_reward);
      toast("🏆 Missão Completa!", {
        description: `${mission.title} — +${mission.xp_reward} XP!`,
        duration: 4000,
      });
    }
  }
}
