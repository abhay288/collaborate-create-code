import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Brain, 
  Calculator, 
  Code, 
  Palette, 
  MessageSquare,
  Trophy,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MyResults = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [latestSession, setLatestSession] = useState<any>(null);
  const [quizStats, setQuizStats] = useState<{
    totalQuestions: number;
    totalCorrect: number;
    totalWrong: number;
    scorePercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load profile with scores
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      // Load latest completed quiz session with responses
      const { data: sessionData } = await supabase
        .from('quiz_sessions')
        .select('*, quiz_responses(*)')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      setLatestSession(sessionData);

      // Calculate quiz stats from responses
      if (sessionData?.quiz_responses) {
        const responses = sessionData.quiz_responses;
        const totalQuestions = responses.length;
        // Consider answers with 4+ points as correct (out of 5)
        const totalCorrect = responses.filter((r: any) => r.points_earned >= 4).length;
        const totalWrong = totalQuestions - totalCorrect;
        const scorePercentage = sessionData.score || Math.round((totalCorrect / totalQuestions) * 100);
        
        setQuizStats({
          totalQuestions,
          totalCorrect,
          totalWrong,
          scorePercentage
        });
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = profile?.overall_score || latestSession?.score;

  const scoreCategories = [
    { 
      label: "Logical Reasoning", 
      key: "logical_score", 
      icon: Brain, 
      color: "hsl(var(--chart-1))",
      bgColor: "bg-primary/10"
    },
    { 
      label: "Numerical Aptitude", 
      key: "numerical_score", 
      icon: Calculator, 
      color: "hsl(var(--chart-2))",
      bgColor: "bg-accent/10"
    },
    { 
      label: "Technical Skills", 
      key: "technical_score", 
      icon: Code, 
      color: "hsl(var(--chart-3))",
      bgColor: "bg-secondary/10"
    },
    { 
      label: "Creative Thinking", 
      key: "creative_score", 
      icon: Palette, 
      color: "hsl(var(--chart-4))",
      bgColor: "bg-muted"
    },
    { 
      label: "Verbal Ability", 
      key: "verbal_score", 
      icon: MessageSquare, 
      color: "hsl(var(--chart-5))",
      bgColor: "bg-primary/5"
    },
  ];

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-500" };
    if (score >= 60) return { label: "Good", color: "bg-blue-500" };
    if (score >= 40) return { label: "Average", color: "bg-yellow-500" };
    return { label: "Needs Improvement", color: "bg-red-500" };
  };

  // Prepare chart data - only include categories with scores > 0
  const barChartData = scoreCategories
    .map(cat => ({
      name: cat.label.split(' ')[0],
      score: Math.round(profile?.[cat.key] || 0),
      fill: cat.color
    }))
    .filter(item => item.score > 0);

  const radarChartData = scoreCategories
    .map(cat => ({
      subject: cat.label.split(' ')[0],
      score: Math.round(profile?.[cat.key] || 0),
      fullMark: 100
    }))
    .filter(item => item.score > 0);

  const hasChartData = barChartData.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Aptitude Results
          </h1>
          <p className="text-muted-foreground mt-2">
            Your quiz performance and skill breakdown
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !hasResults ? (
          <Card className="border-primary/20">
            <CardContent className="py-16 text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Results Yet</h2>
              <p className="text-muted-foreground mb-6">
                Please take the Aptitude Quiz to view your results and recommendations.
              </p>
              <Button asChild>
                <Link to="/quiz">Take Aptitude Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Quiz Stats Summary */}
            {quizStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-primary/20">
                  <CardContent className="py-4 text-center">
                    <p className="text-3xl font-bold text-primary">{quizStats.totalQuestions}</p>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                  </CardContent>
                </Card>
                <Card className="border-green-500/20">
                  <CardContent className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <p className="text-3xl font-bold text-green-500">{quizStats.totalCorrect}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </CardContent>
                </Card>
                <Card className="border-red-500/20">
                  <CardContent className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <p className="text-3xl font-bold text-red-500">{quizStats.totalWrong}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Wrong</p>
                  </CardContent>
                </Card>
                <Card className="border-accent/20">
                  <CardContent className="py-4 text-center">
                    <p className="text-3xl font-bold text-accent">{quizStats.scorePercentage}%</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Overall Score */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <div className="w-32 h-32 rounded-full bg-background flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-4xl font-bold text-primary">
                            {Math.round(profile?.overall_score || latestSession?.score || 0)}
                          </span>
                          <span className="text-lg text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {getScoreLevel(profile?.overall_score || latestSession?.score || 0).label} Performance!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Based on your quiz responses, we've analyzed your aptitude across multiple categories.
                    </p>
                    {latestSession?.completed_at && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Completed on {new Date(latestSession.completed_at).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            {hasChartData && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Category Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value: number) => [`${value}%`, 'Score']}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))'
                            }}
                          />
                          <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Skill Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarChartData}>
                          <PolarGrid className="opacity-30" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value}%`, 'Score']}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Category Scores */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Skill Breakdown
                </CardTitle>
                <CardDescription>
                  Your performance across different aptitude categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {scoreCategories.map((category) => {
                    const score = profile?.[category.key] || 0;
                    const Icon = category.icon;
                    const level = getScoreLevel(score);
                    
                    // Only show categories with scores
                    if (score === 0) return null;
                    
                    return (
                      <div key={category.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${category.bgColor}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="font-medium">{category.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={level.color.replace('bg-', 'border-')}>
                              {level.label}
                            </Badge>
                            <span className="font-bold text-lg">{Math.round(score)}%</span>
                          </div>
                        </div>
                        <Progress 
                          value={score} 
                          className="h-3"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/quiz">
                  Retake Quiz
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/recommended-courses">
                  View Recommended Courses
                </Link>
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <Link to="/recommended-colleges">
                  View Recommended Colleges
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyResults;