import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Zap, Loader2, ArrowLeft, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function CareerRiskPage() {
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

  const riskBg = (level: string) =>
    level === "low" ? "bg-green-500" : level === "medium" ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Dashboard</Link>
          <span>/</span><span className="text-foreground font-medium">Career Risk Predictor</span>
        </div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
            <CardTitle className="flex items-center gap-2 text-2xl"><AlertTriangle className="h-6 w-6 text-orange-500" /> AI Career Risk Predictor</CardTitle>
            <CardDescription>Analyze automation risk, industry growth, and future demand for any career</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
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

            {loading && <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>}

            {results.length > 0 && (
              <div className="space-y-4 mt-4 animate-fade-up">
                {results.map((r, i) => (
                  <div key={i} className="p-5 rounded-xl border border-muted space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{r.name}</h3>
                      <Badge className={cn("text-white", riskBg(r.risk_level))}>{r.risk_level} risk</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30"><p className="text-2xl font-bold text-red-500">{r.automation_risk_percent}%</p><p className="text-xs text-muted-foreground">Automation Risk</p></div>
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30"><p className="text-2xl font-bold text-green-600">{r.industry_growth_percent > 0 ? '+' : ''}{r.industry_growth_percent}%</p><p className="text-xs text-muted-foreground">Industry Growth</p></div>
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30"><p className="text-2xl font-bold text-primary">{r.future_demand_index}/10</p><p className="text-xs text-muted-foreground">Demand Index</p></div>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.reasoning}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
