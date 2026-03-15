import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const XP_FAVORITE = 10;
const XP_WATCHED = 50;

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function xpForNextLevel(xp: number): { current: number; needed: number } {
  const currentInLevel = xp % 100;
  return { current: currentInLevel, needed: 100 };
}

export async function updateXP(userId: string, delta: number) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, level")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const newXP = Math.max(0, profile.xp + delta);
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > profile.level;

  await supabase
    .from("profiles")
    .update({ xp: newXP, level: newLevel })
    .eq("id", userId);

  if (delta > 0) {
    toast.success(`+${delta} XP!`, { duration: 2000 });
  }
  if (leveledUp) {
    toast("🎉 Level Up!", {
      description: `Você subiu para o nível ${newLevel}!`,
      duration: 4000,
    });
  }
}

export { XP_FAVORITE, XP_WATCHED };
