import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Star, Loader2, ArrowRight, ArrowLeft, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function ProfileStrengthPage() {
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
    level === "Expert" ? "text-purple-600" : level === "Advanced" ? "text-blue-600" : level === "Intermediate" ? "text-yellow-600" : "text-muted-foreground";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Dashboard</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Profile Strength</span>
        </div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2 text-2xl"><Shield className="h-6 w-6 text-primary" /> AI Profile Strength Score</CardTitle>
            <CardDescription>Get your profile scored by AI — completeness, engagement, and market readiness</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!data ? (
              <div className="text-center py-8">
                <Shield className="h-16 w-16 mx-auto mb-4 text-primary/30" />
                <p className="text-muted-foreground mb-6">Analyze your profile's completeness, engagement, and market readiness.</p>
                <Button onClick={analyze} disabled={loading} size="lg">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Star className="mr-2 h-4 w-4" /> Analyze My Profile</>}
                </Button>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-up">
                <div className="text-center">
                  <p className={cn("text-6xl font-bold", data.overall_score >= 70 ? "text-green-600" : data.overall_score >= 40 ? "text-yellow-600" : "text-red-500")}>{data.overall_score}%</p>
                  <p className={cn("text-lg font-medium mt-2", levelColor(data.level))}>{data.level} • {data.xp_points} XP</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-muted/50 border"><p className="text-2xl font-bold">{data.completeness_score}%</p><p className="text-sm text-muted-foreground">Profile</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 border"><p className="text-2xl font-bold">{data.engagement_score}%</p><p className="text-sm text-muted-foreground">Engagement</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 border"><p className="text-2xl font-bold">{data.aptitude_score}%</p><p className="text-sm text-muted-foreground">Aptitude</p></div>
                </div>
                {data.suggestions?.length > 0 && (
                  <div className="space-y-3">
                    <p className="font-medium">Improvement Suggestions:</p>
                    {data.suggestions.map((s: string, i: number) => (
                      <p key={i} className="text-sm flex items-start gap-2 p-3 rounded-lg bg-muted/30"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />{s}</p>
                    ))}
                  </div>
                )}
                <Button variant="outline" onClick={analyze} disabled={loading} className="w-full">{loading ? "Refreshing..." : "Refresh Score"}</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
