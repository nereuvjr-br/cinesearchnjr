import { Target, CheckCircle, Circle, Swords, Compass } from "lucide-react";
import { useMissions } from "@/hooks/useMissions";
import { Progress } from "@/components/ui/progress";

const typeIcons: Record<string, any> = {
  daily: Target,
  progress: Swords,
  exploration: Compass,
};

const typeLabels: Record<string, string> = {
  daily: "Diárias",
  progress: "Progresso",
  exploration: "Exploração",
};

const MissionsPanel = () => {
  const { missions, userMissions } = useMissions();

  if (!missions?.length) return null;

  const grouped = missions.reduce((acc: Record<string, any[]>, m: any) => {
    acc[m.type] = acc[m.type] || [];
    acc[m.type].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, typeMissions]) => {
        const Icon = typeIcons[type] || Target;
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">
                Missões {typeLabels[type]}
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {typeMissions.map((mission: any) => {
                const um = userMissions?.find((u: any) => u.mission_id === mission.id);
                const progress = um?.progress || 0;
                const completed = um?.completed || false;
                const pct = Math.min((progress / mission.target_count) * 100, 100);

                return (
                  <div
                    key={mission.id}
                    className={`glass-card p-4 space-y-2 transition-all ${
                      completed ? "border-primary/30 bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {completed ? (
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{mission.title}</p>
                          <p className="text-xs text-muted-foreground">{mission.description}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary shrink-0">
                        +{mission.xp_reward} XP
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress value={pct} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground text-right">
                        {progress}/{mission.target_count}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MissionsPanel;
