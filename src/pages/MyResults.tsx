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
  BarChart3
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MyResults = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [latestSession, setLatestSession] = useState<any>(null);
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

      // Load latest completed quiz session
      const { data: sessionData } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      setLatestSession(sessionData);
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
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10"
    },
    { 
      label: "Numerical Aptitude", 
      key: "numerical_score", 
      icon: Calculator, 
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10"
    },
    { 
      label: "Technical Skills", 
      key: "technical_score", 
      icon: Code, 
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10"
    },
    { 
      label: "Creative Thinking", 
      key: "creative_score", 
      icon: Palette, 
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10"
    },
    { 
      label: "Verbal Ability", 
      key: "verbal_score", 
      icon: MessageSquare, 
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-500/10"
    },
  ];

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-500" };
    if (score >= 60) return { label: "Good", color: "bg-blue-500" };
    if (score >= 40) return { label: "Average", color: "bg-yellow-500" };
    return { label: "Needs Improvement", color: "bg-red-500" };
  };

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
