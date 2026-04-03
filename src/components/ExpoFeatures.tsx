import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, TrendingUp, Zap, Shield, Loader2, ArrowRight,
  Scale, Trophy, Star, Target
} from "lucide-react";

// ========== CAREER RISK PREDICTOR ==========
export function CareerRiskPredictor() {
  const [careers, setCareers] = useState<string[]>([""]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    const valid = careers.filter(c => c.trim());
    if (valid.length === 0) { toast.error("Enter at least one career"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-insights", {
        body: { action: "career_risk", careers: valid },
      });
      if (error) throw error;
      setResults(data.careers || []);
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (level: string) =>
    level === "low" ? "text-green-600" : level === "medium" ? "text-yellow-600" : "text-red-500";
  const riskBg = (level: string) =>
    level === "low" ? "bg-green-500" : level === "medium" ? "bg-yellow-500" : "bg-red-500";

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" /> AI Career Risk Predictor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Analyze automation risk, industry growth, and future demand for any career.</p>
        {careers.map((c, i) => (
          <div key={i} className="flex gap-2">
            <Input value={c} onChange={e => setCareers(prev => prev.map((v, j) => j === i ? e.target.value : v))} placeholder={`Career ${i + 1} (e.g., Data Scientist)`} />
            {careers.length > 1 && <Button variant="ghost" size="icon" onClick={() => setCareers(prev => prev.filter((_, j) => j !== i))}>✕</Button>}
          </div>
        ))}
        <div className="flex gap-2">
          {careers.length < 5 && <Button variant="outline" size="sm" onClick={() => setCareers(prev => [...prev, ""])}>+ Add Career</Button>}
          <Button onClick={analyze} disabled={loading} className="flex-1">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Zap className="mr-2 h-4 w-4" /> Analyze Risk</>}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4 mt-4">
            {results.map((r, i) => (
              <div key={i} className="p-4 rounded-lg border border-muted space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{r.name}</h3>
                  <Badge className={cn("text-white", riskBg(r.risk_level))}>{r.risk_level} risk</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-red-500">{r.automation_risk_percent}%</p>
                    <p className="text-xs text-muted-foreground">Automation Risk</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{r.industry_growth_percent > 0 ? '+' : ''}{r.industry_growth_percent}%</p>
                    <p className="text-xs text-muted-foreground">Industry Growth</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{r.future_demand_index}/10</p>
                    <p className="text-xs text-muted-foreground">Demand Index</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.reasoning}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== CAREER COMPARISON ENGINE ==========
export function CareerComparison() {
  const [career1, setCareer1] = useState("");
  const [career2, setCareer2] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const compare = async () => {
    if (!career1.trim() || !career2.trim()) { toast.error("Enter both careers"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-insights", {
        body: { action: "compare_careers", career1, career2 },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      toast.error(e.message || "Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  const ComparisonCard = ({ data, label }: { data: any; label: string }) => (
    <div className="p-4 rounded-lg border border-muted space-y-3 flex-1">
      <h3 className="font-bold text-lg text-center">{data?.name || label}</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Salary Range</span><span className="font-medium">{data?.avg_salary_range}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Study Cost</span><span className="font-medium">{data?.study_cost_estimate}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Growth</span><span className="font-medium">{data?.growth_rating}/10</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Competition</span><Badge variant="outline" className="capitalize">{data?.competition_level}</Badge></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Time to Establish</span><span className="font-medium">{data?.time_to_establish} yrs</span></div>
      </div>
      {data?.key_skills && <div className="flex flex-wrap gap-1">{data.key_skills.map((s: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}</div>}
      {data?.pros && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-green-600">✅ Pros</p>
          {data.pros.map((p: string, i: number) => <p key={i} className="text-xs text-muted-foreground">• {p}</p>)}
        </div>
      )}
      {data?.cons && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-red-500">❌ Cons</p>
          {data.cons.map((c: string, i: number) => <p key={i} className="text-xs text-muted-foreground">• {c}</p>)}
        </div>
      )}
    </div>
  );

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-primary" /> Career Comparison Engine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input value={career1} onChange={e => setCareer1(e.target.value)} placeholder="Career 1 (e.g., Software Engineer)" />
          <Input value={career2} onChange={e => setCareer2(e.target.value)} placeholder="Career 2 (e.g., Data Scientist)" />
        </div>
        <Button onClick={compare} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Comparing...</> : <><Scale className="mr-2 h-4 w-4" /> Compare Careers</>}
        </Button>

        {result && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ComparisonCard data={result.career1} label={career1} />
              <ComparisonCard data={result.career2} label={career2} />
            </div>
            {result.verdict && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <p className="text-sm font-medium"><Trophy className="h-4 w-4 inline mr-1 text-primary" /> {result.verdict}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== PROFILE STRENGTH SCORE ==========
export function ProfileStrengthScore() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("career-insights", {
        body: { action: "profile_strength" },
      });
      if (error) throw error;
      setData(result);
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const levelColor = (level: string) =>
    level === "Expert" ? "text-purple-600" : level === "Advanced" ? "text-blue-600" : level === "Intermediate" ? "text-yellow-600" : "text-gray-500";

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> AI Profile Strength</CardTitle>
      </CardHeader>
      <CardContent>
        {!data ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">Get your profile scored by AI — completeness, engagement, and market readiness.</p>
            <Button onClick={analyze} disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Star className="mr-2 h-4 w-4" /> Analyze My Profile</>}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className={cn("text-5xl font-bold", data.overall_score >= 70 ? "text-green-600" : data.overall_score >= 40 ? "text-yellow-600" : "text-red-500")}>
                {data.overall_score}%
              </p>
              <p className={cn("text-sm font-medium mt-1", levelColor(data.level))}>{data.level} • {data.xp_points} XP</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="p-2 rounded-lg bg-muted/50"><p className="font-bold">{data.completeness_score}%</p><p className="text-xs text-muted-foreground">Profile</p></div>
              <div className="p-2 rounded-lg bg-muted/50"><p className="font-bold">{data.engagement_score}%</p><p className="text-xs text-muted-foreground">Engagement</p></div>
              <div className="p-2 rounded-lg bg-muted/50"><p className="font-bold">{data.aptitude_score}%</p><p className="text-xs text-muted-foreground">Aptitude</p></div>
            </div>
            {data.suggestions?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Suggestions:</p>
                {data.suggestions.map((s: string, i: number) => (
                  <p key={i} className="text-xs flex items-start gap-1"><ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />{s}</p>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={analyze} disabled={loading} className="w-full">
              {loading ? "Refreshing..." : "Refresh Score"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
