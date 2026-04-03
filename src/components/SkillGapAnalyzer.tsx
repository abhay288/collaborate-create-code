import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Loader2, Search, Lightbulb, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SkillGapResult {
  required_skills: string[];
  user_skills: string[];
  missing_skills: string[];
  match_percentage: number;
  recommendations: string[];
}

interface Props {
  careerId?: string;
  careerTitle?: string;
  compact?: boolean;
}

export default function SkillGapAnalyzer({ careerId, careerTitle: initialTitle, compact }: Props) {
  const { user } = useAuth();
  const [careerTitle, setCareerTitle] = useState(initialTitle || "");
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const calculateMatch = (currentSkills: string[], required: string[]) => {
    if (required.length === 0) return 0;
    const matchCount = required.filter(rs => 
      currentSkills.some(us => us.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(us.toLowerCase()))
    ).length;
    return Math.round((matchCount / required.length) * 100);
  };

  const addSkill = () => {
    if (newSkill.trim() && !userSkills.includes(newSkill.trim())) {
      const updated = [...userSkills, newSkill.trim()];
      setUserSkills(updated);
      setNewSkill("");
      if (result) {
        setResult({
          ...result,
          user_skills: updated,
          match_percentage: calculateMatch(updated, result.required_skills),
          missing_skills: result.required_skills.filter(rs => 
            !updated.some(us => us.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(us.toLowerCase()))
          )
        });
      }
    }
  };

  const removeSkill = (skill: string) => {
    const updated = userSkills.filter(s => s !== skill);
    setUserSkills(updated);
    if (result) {
      setResult({
        ...result,
        user_skills: updated,
        match_percentage: calculateMatch(updated, result.required_skills),
        missing_skills: result.required_skills.filter(rs => 
          !updated.some(us => us.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(us.toLowerCase()))
        )
      });
    }
  };

  const analyze = async () => {
    if (!careerTitle.trim()) { toast.error("Enter a career title"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-skill-gap", {
        body: { careerId, careerTitle: careerTitle.trim() },
      });
      if (error) throw error;
      setResult(data);
      setUserSkills(data.user_skills);
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  if (compact && !result) {
    return (
      <Button variant="outline" size="sm" onClick={analyze} disabled={loading} className="gap-1.5">
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3 w-3" />}
        Skill Gap
      </Button>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className={compact ? "pb-2 pt-3 px-4" : "bg-gradient-to-r from-primary/5 to-accent/5"}>
        <CardTitle className={`flex items-center gap-2 ${compact ? "text-base" : ""}`}>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Skill Gap Analyzer
        </CardTitle>
        {!compact && <CardDescription>Compare your skills vs career requirements</CardDescription>}
      </CardHeader>
      <CardContent className={compact ? "px-4 pb-4 pt-2" : "pt-4"}>
        {!initialTitle && (
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="e.g. Data Scientist, Lawyer..."
              value={careerTitle}
              onChange={e => setCareerTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && analyze()}
            />
            <Button onClick={analyze} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        )}

            {/* Dynamic Skill Input */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Update Your Skills</p>
              <div className="flex gap-2 mb-3">
                <Input 
                  placeholder="Add a skill..." 
                  value={newSkill} 
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addSkill()}
                  className="h-8 text-xs"
                />
                <Button size="sm" variant="outline" onClick={addSkill} className="h-8">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {userSkills.map((s, i) => (
                  <Badge key={i} variant="secondary" className="pl-2 gap-1 group">
                    {s}
                    <button onClick={() => removeSkill(s)} className="hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Match Percentage */}
            <div className="py-2">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground font-medium">Real-time Skill Match</span>
                <span className="font-bold tabular-nums" style={{ color: result.match_percentage >= 70 ? "hsl(var(--primary))" : result.match_percentage >= 40 ? "hsl(45 93% 47%)" : "hsl(0 84% 60%)" }}>
                  {result.match_percentage}%
                </span>
              </div>
              <Progress value={result.match_percentage} className="h-2.5 transition-all duration-500" />
            </div>

            {/* Skills Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-green-600 flex items-center gap-1.5 uppercase tracking-tighter">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Matched Skills
                </p>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                  {result.required_skills.filter(rs => 
                    userSkills.some(us => us.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(us.toLowerCase()))
                  ).map((s, i) => (
                    <Badge key={i} className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200">{s}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-bold text-red-600 flex items-center gap-1.5 uppercase tracking-tighter">
                  <AlertTriangle className="h-3.5 w-3.5" /> Skills to Acquire
                </p>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                  {result.missing_skills.map((s, i) => (
                    <Badge key={i} variant="destructive" className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1.5 flex items-center gap-1 text-primary">
                  <Lightbulb className="h-3 w-3" /> Recommendations
                </p>
                <ul className="text-xs space-y-1">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {initialTitle && (
              <Button variant="outline" size="sm" onClick={analyze} disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Search className="h-3 w-3 mr-1" />}
                Re-analyze
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
