import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const CareerTwinPage = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generateTwin = async () => {
    if (!user || !session?.access_token) {
      toast.error("Please log in first");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!profile) { toast.error("Complete your profile first"); setLoading(false); return; }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: "career_twin",
          profile: {
            interests: profile.interests,
            education: profile.current_study_level,
            course: profile.current_course,
            skills: profile.target_course_interest,
            state: profile.preferred_state,
            scores: {
              overall: profile.overall_score,
              logical: profile.logical_score,
              verbal: profile.verbal_score,
              creative: profile.creative_score,
              technical: profile.technical_score,
            },
          },
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate Career Twin");
      }
      
      const data = await resp.json();
      setResult(data.result || data.analysis || JSON.stringify(data, null, 2));
    } catch (e: any) {
      toast.error(e.message || "Failed to generate Career Twin analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild><Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-primary" />AI Career Twin</h1>
            <p className="text-sm text-muted-foreground">Discover your digital career persona based on your profile</p>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Your Career Twin Analysis</CardTitle>
            <CardDescription>
              AI analyzes your aptitude scores, interests, and education to create a career persona — matching you with real-world career archetypes and suggesting your ideal career path.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="text-center py-8">
                <Brain className="h-16 w-16 mx-auto mb-4 text-primary/30" />
                <p className="text-muted-foreground mb-6">Click below to discover your AI Career Twin — a personalized analysis of your career archetype, strengths, and ideal path.</p>
                <Button onClick={generateTwin} size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />Generate My Career Twin
                </Button>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing your profile and creating your Career Twin...</p>
              </div>
            )}

            {result && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
                <div className="mt-6 flex gap-3">
                  <Button onClick={generateTwin} variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />Regenerate
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CareerTwinPage;
