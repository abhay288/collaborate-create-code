import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Map, ChevronRight, Loader2, RefreshCw, CheckCircle2, BookOpen, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RoadmapStep {
  year: number;
  title: string;
  actions: string[];
  skills: string[];
  milestones: string[];
}

export default function CareerRoadmap() {
  const { user } = useAuth();
  const [career, setCareer] = useState("");
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [targetCareer, setTargetCareer] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedRoadmaps, setSavedRoadmaps] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadSavedRoadmaps();
  }, [user]);

  const loadSavedRoadmaps = async () => {
    const { data } = await supabase
      .from("career_roadmaps")
      .select("*")
      .eq("user_id", user!.id)
      .order("updated_at", { ascending: false });
    if (data) setSavedRoadmaps(data);
    if (data && data.length > 0) {
      setRoadmap(data[0].roadmap_json as unknown as RoadmapStep[]);
      setTargetCareer(data[0].target_career || "");
    }
  };

  const generate = async () => {
    if (!career.trim()) { toast.error("Enter a target career"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-career-roadmap", {
        body: { targetCareer: career.trim() },
      });
      if (error) throw error;
      setRoadmap(data.roadmap);
      setTargetCareer(data.targetCareer);
      toast.success("Roadmap generated!");
      loadSavedRoadmaps();
    } catch (e: any) {
      toast.error(e.message || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          Career Roadmap
        </CardTitle>
        <CardDescription>AI-powered year-wise career plan</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Software Engineer, Doctor, IAS..."
            value={career}
            onChange={e => setCareer(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
          />
          <Button onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Saved roadmaps quick switch */}
        {savedRoadmaps.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {savedRoadmaps.map(r => (
              <Badge
                key={r.id}
                variant={r.target_career === targetCareer ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setRoadmap(r.roadmap_json as unknown as RoadmapStep[]);
                  setTargetCareer(r.target_career);
                }}
              >
                {r.target_career}
              </Badge>
            ))}
          </div>
        )}

        {roadmap.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-primary">
              Roadmap: {targetCareer}
            </h3>
            <div className="relative pl-6 space-y-6">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary to-accent" />

              {roadmap.map((step, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </div>
                  <Card className="border-muted hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{step.title}</h4>
                        <Badge variant="secondary">{step.year}</Badge>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Target className="h-3 w-3" /> Actions</p>
                        <ul className="text-xs space-y-1">
                          {step.actions.map((a, j) => (
                            <li key={j} className="flex items-start gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {step.skills.map((s, j) => (
                          <Badge key={j} variant="outline" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
