import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Share2, Download, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useCareerRecommendations } from "@/hooks/useCareerRecommendations";
import { useOpportunityMapping } from "@/hooks/useOpportunityMapping";
import OpportunityRecommendations from "@/components/OpportunityRecommendations";

const categoryDescriptions: Record<string, string> = {
  "logical": "Your ability to think systematically and solve problems using logic and deduction.",
  "analytical": "Your capacity to analyze information, identify patterns, and draw conclusions.",
  "creative": "Your ability to think innovatively and generate original ideas.",
  "technical": "Your enthusiasm and aptitude for technology and technical concepts.",
  "quantitative": "Your proficiency with numbers, calculations, and mathematical reasoning.",
  "verbal": "Your communication skills and language proficiency.",
  "interpersonal": "Your ability to interact effectively with others and work in teams."
};

export default function QuizResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const { recommendations, getRecommendations } = useCareerRecommendations();
  const { opportunities, mapOpportunities } = useOpportunityMapping();
  const [loading, setLoading] = useState(true);
  const [quizSession, setQuizSession] = useState<any>(null);
  const [categoryScores, setCategoryScores] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionId) {
      toast.error('No quiz session found');
      navigate('/quiz');
      return;
    }

    const loadResults = async () => {
      try {
        // Fetch quiz session
        const { data: session, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        setQuizSession(session);

        // Fetch quiz responses with question details
        const { data: responses, error: responsesError } = await supabase
          .from('quiz_responses')
          .select(`
            *,
            quiz_questions (category)
          `)
          .eq('quiz_session_id', sessionId);

        if (responsesError) throw responsesError;

        // Use category_scores from session if available, otherwise calculate from responses
        if (session.category_scores && Object.keys(session.category_scores).length > 0) {
          const scores = Object.entries(session.category_scores).map(([category, data]: [string, any]) => ({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            score: Math.round((data.total / data.max) * 100),
            maxScore: 100
          }));
          setCategoryScores(scores);
        } else {
          // Calculate category scores from responses with points
          const categoryMap: Record<string, { total: number; max: number }> = {};
          
          responses.forEach((response: any) => {
            const category = response.quiz_questions?.category || 'general';
            if (!categoryMap[category]) {
              categoryMap[category] = { total: 0, max: 0 };
            }
            categoryMap[category].total += response.points_earned || 0;
            categoryMap[category].max += 5; // Max 5 points per question
          });

          const scores = Object.entries(categoryMap).map(([category, data]) => ({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            score: Math.round((data.total / data.max) * 100),
            maxScore: 100
          }));

          setCategoryScores(scores);
        }

        // Load career recommendations
        await getRecommendations(sessionId);

        // Get user profile for opportunity mapping
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            // Map opportunities based on quiz results
            const aptitudeProfile = {
              user_id: user.id,
              skills: {
                logical: categoryScores.find(s => s.category.toLowerCase() === 'logical')?.score || 70,
                verbal: categoryScores.find(s => s.category.toLowerCase() === 'verbal')?.score || 70,
                quantitative: categoryScores.find(s => s.category.toLowerCase() === 'quantitative')?.score || 70,
                creative: categoryScores.find(s => s.category.toLowerCase() === 'creative')?.score || 70,
                technical: categoryScores.find(s => s.category.toLowerCase() === 'technical')?.score || 70,
                interpersonal: categoryScores.find(s => s.category.toLowerCase() === 'interpersonal')?.score || 70
              },
              interests: profile.interests || [],
              preferred_locations: ['Uttar Pradesh'],
              academic_level: (profile.class_level === 'UG' ? 'UG' : 
                              profile.class_level === 'PG' ? 'PG' : 'Diploma') as 'UG' | 'PG' | 'Diploma',
              score_percentile_or_band: session.score || 70
            };

            await mapOpportunities(aptitudeProfile);
          }
        }
      } catch (error) {
        console.error('Error loading results:', error);
        toast.error('Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!quizSession) {
    return <div>Error loading results</div>;
  }

  const overallScore = quizSession.score || Math.round(categoryScores.reduce((sum, cat) => sum + cat.score, 0) / categoryScores.length);

  const chartData = categoryScores.map(cat => ({
    category: cat.category,
    score: cat.score
  }));

  const radarData = categoryScores.map(cat => ({
    subject: cat.category.split(' ')[0],
    A: cat.score,
    fullMark: 100
  }));

  const handleShare = () => {
    toast.success("Results link copied to clipboard!");
  };

  const handleDownload = () => {
    toast.success("Results downloaded as PDF!");
  };

  const handleRetake = () => {
    localStorage.removeItem('quiz-results');
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Assessment Complete!</h1>
          <p className="text-muted-foreground">Here's your personalized career guidance based on your aptitude</p>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-6xl font-bold text-primary mb-2">{overallScore}%</CardTitle>
            <CardDescription className="text-lg">Overall Aptitude Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 mb-6">
              <Button onClick={handleShare} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handleRetake} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
            </div>
            <Progress value={overallScore} className="h-3" />
          </CardContent>
        </Card>

        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="careers">AI Careers</TabsTrigger>
            <TabsTrigger value="opportunities">Real Opportunities</TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Your scores across different categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      score: {
                        label: "Score",
                        color: "hsl(var(--primary))"
                      }
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="score" fill="var(--color-score)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Skill Profile</CardTitle>
                  <CardDescription>Your aptitude across key areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      A: {
                        label: "Your Score",
                        color: "hsl(var(--primary))"
                      }
                    }}
                    className="h-[300px]"
                  >
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Your Score" dataKey="A" stroke="var(--color-A)" fill="var(--color-A)" fillOpacity={0.6} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Category Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {categoryScores.map((cat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{cat.category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {categoryDescriptions[cat.category as keyof typeof categoryDescriptions]}
                        </p>
                      </div>
                      <Badge variant={cat.score >= 80 ? "default" : cat.score >= 60 ? "secondary" : "outline"}>
                        {cat.score}%
                      </Badge>
                    </div>
                    <Progress value={cat.score} className="h-2" />
                    {index < categoryScores.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Careers Tab - AI Generated */}
          <TabsContent value="careers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>AI-Generated Career Recommendations</CardTitle>
                </div>
                <CardDescription>
                  Career paths suggested by AI based on your aptitude assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((career: any, index: number) => (
                    <Card key={index} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{career.career_title}</CardTitle>
                            <CardDescription className="mt-2">{career.description}</CardDescription>
                          </div>
                          <Badge className="text-lg px-3 py-1">{career.confidence_score}% Match</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {career.requirements && (
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Key Requirements:</h5>
                              <div className="flex flex-wrap gap-2">
                                {career.requirements.split(',').map((req: string, i: number) => (
                                  <Badge key={i} variant="secondary">{req.trim()}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No AI career recommendations available yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            {opportunities ? (
              <OpportunityRecommendations data={opportunities} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading real opportunities...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
