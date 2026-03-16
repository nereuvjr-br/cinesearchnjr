import Header from "@/components/Header";
import MissionsPanel from "@/components/MissionsPanel";
import { Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Missions = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Header showSearch={false} />
      <main className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">Missões</h1>
        </div>
        <MissionsPanel />
      </main>
    </div>
  );
};

export default Missions;
