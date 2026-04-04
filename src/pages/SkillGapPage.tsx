import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, Loader2, Search, Lightbulb, ArrowLeft, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface SkillGapResult {
  required_skills: string[];
  user_skills: string[];
  missing_skills: string[];
  match_percentage: number;
  recommendations: string[];
}

export default function SkillGapPage() {
  const [careerTitle, setCareerTitle] = useState("");
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cachedTitle, setCachedTitle] = useState("");

  // Inappropriate words blocklist
  const BLOCKED_WORDS = [
    'thief', 'chor', 'murderer', 'killer', 'terrorist', 'drug dealer',
    'smuggler', 'prostitute', 'beggar', 'scammer', 'fraudster', 'hacker',
    'assassin', 'robber', 'dacoit', 'gangster', 'pirate', 'kidnapper',
    'crime', 'criminal', 'theft', 'murder', 'illegal', 'smuggling', 'robbery',
    'snatcher', 'pickpocket', 'thieving', 'burglar', 'looter', 'gambler'
  ];

  const isInappropriate = (text: string) => {
    const lower = text.toLowerCase().trim();
    return BLOCKED_WORDS.some(word => lower.includes(word));
  };

  const analyze = async () => {
    if (!careerTitle.trim()) { toast.error("Enter a career title"); return; }
    
    // Reset previous result immediately to avoid 'ghosting' for blocked terms
    setResult(null);
    setCachedTitle("");
    
    // Block inappropriate inputs
    if (isInappropriate(careerTitle)) {
      toast.error("Sorry, we can't provide any information about this.");
      return;
    }
    
    // If same title and we have cached result, reuse it
    if (careerTitle.trim().toLowerCase() === cachedTitle.toLowerCase() && result) {
      toast.info("Showing cached result. Change the career title to re-analyze.");
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-skill-gap", {
        body: { careerTitle: careerTitle.trim() },
      });
      if (error) throw error;
      setResult(data);
      setCachedTitle(careerTitle.trim());
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Dashboard</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Skill Gap Analyzer</span>
        </div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Skill Gap Analyzer
            </CardTitle>
            <CardDescription>Compare your skills against career requirements and get personalized recommendations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-2">
              <Input placeholder="e.g. Data Scientist, Lawyer..." value={careerTitle} onChange={e => setCareerTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && analyze()} className="text-base" />
              <Button onClick={analyze} disabled={loading} size="lg">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-1" /> Analyze</>}
              </Button>
            </div>

            {loading && <div className="space-y-3"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-3 w-full" /><Skeleton className="h-20 w-full" /></div>}

            {result && (
              <div className="space-y-6 animate-fade-up">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Skill Match</span>
                    <span className="font-bold text-lg" style={{ color: result.match_percentage >= 70 ? "hsl(var(--primary))" : result.match_percentage >= 40 ? "hsl(45 93% 47%)" : "hsl(0 84% 60%)" }}>
                      {result.match_percentage}%
                    </span>
                  </div>
                  <Progress value={result.match_percentage} className="h-3" />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" /> Skills You Have ({result.user_skills.length})</p>
                  <div className="flex flex-wrap gap-1.5">{result.user_skills.map((s, i) => <Badge key={i} className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{s}</Badge>)}</div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1 text-red-600"><AlertTriangle className="h-4 w-4" /> Missing Skills ({result.missing_skills.length})</p>
                  <div className="flex flex-wrap gap-1.5">{result.missing_skills.map((s, i) => <Badge key={i} variant="destructive">{s}</Badge>)}</div>
                </div>

                {result.recommendations?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1 text-primary"><Lightbulb className="h-4 w-4" /> Recommendations</p>
                    <ul className="text-sm space-y-2">
                      {result.recommendations.map((r, i) => <li key={i} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{r}</li>)}
                    </ul>
                  </div>
                )}

                <Button variant="outline" onClick={analyze} disabled={loading} className="w-full">
                  {loading ? "Re-analyzing..." : "Re-analyze"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
