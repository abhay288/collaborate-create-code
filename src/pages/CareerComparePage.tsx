import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, Trophy, Loader2, ArrowLeft, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function CareerComparePage() {
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
    <Card className="flex-1">
      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold text-lg text-center">{data?.name || label}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Salary Range</span><span className="font-medium">{data?.avg_salary_range}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Study Cost</span><span className="font-medium">{data?.study_cost_estimate}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Growth</span><span className="font-medium">{data?.growth_rating}/10</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Competition</span><Badge variant="outline" className="capitalize">{data?.competition_level}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time to Establish</span><span className="font-medium">{data?.time_to_establish} yrs</span></div>
        </div>
        {data?.key_skills && <div className="flex flex-wrap gap-1">{data.key_skills.map((s: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}</div>}
        {data?.pros && <div className="space-y-1"><p className="text-xs font-medium text-green-600">✅ Pros</p>{data.pros.map((p: string, i: number) => <p key={i} className="text-xs text-muted-foreground">• {p}</p>)}</div>}
        {data?.cons && <div className="space-y-1"><p className="text-xs font-medium text-red-500">❌ Cons</p>{data.cons.map((c: string, i: number) => <p key={i} className="text-xs text-muted-foreground">• {c}</p>)}</div>}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Dashboard</Link>
          <span>/</span><span className="text-foreground font-medium">Career Comparison</span>
        </div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2 text-2xl"><Scale className="h-6 w-6 text-primary" /> Career Comparison Engine</CardTitle>
            <CardDescription>Compare two careers side-by-side across salary, growth, competition, and more</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input value={career1} onChange={e => setCareer1(e.target.value)} placeholder="Career 1 (e.g., Software Engineer)" className="text-base" />
              <Input value={career2} onChange={e => setCareer2(e.target.value)} placeholder="Career 2 (e.g., Data Scientist)" className="text-base" />
            </div>
            <Button onClick={compare} disabled={loading} className="w-full" size="lg">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Comparing...</> : <><Scale className="mr-2 h-4 w-4" /> Compare Careers</>}
            </Button>

            {loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-64 w-full" />)}</div>}

            {result && (
              <div className="space-y-4 animate-fade-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ComparisonCard data={result.career1} label={career1} />
                  <ComparisonCard data={result.career2} label={career2} />
                </div>
                {result.verdict && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                    <p className="font-medium"><Trophy className="h-5 w-5 inline mr-2 text-primary" />{result.verdict}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
