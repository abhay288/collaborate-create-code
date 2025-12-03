import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  Target, 
  TrendingUp,
  Briefcase,
  GraduationCap,
  Lightbulb,
  CheckCircle2
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const RecommendedCourses = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasQuizResults, setHasQuizResults] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      // Load career recommendations from latest completed quiz
      const { data: sessionData } = await supabase
        .from('quiz_sessions')
        .select(`
          *,
          career_recommendations:career_recommendations(
            *,
            careers(*)
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (sessionData) {
        setHasQuizResults(true);
        setRecommendations(sessionData.career_recommendations || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate course recommendations based on profile and scores
  const getCourseRecommendations = () => {
    if (!profile) return [];

    const courses = [];
    const scores = {
      technical: profile.technical_score || 0,
      logical: profile.logical_score || 0,
      numerical: profile.numerical_score || 0,
      creative: profile.creative_score || 0,
      verbal: profile.verbal_score || 0,
    };

    // High technical score
    if (scores.technical >= 60) {
      courses.push({
        course: "B.Tech / B.E.",
        branches: ["Computer Science", "Information Technology", "Electronics", "Mechanical"],
        reason: "High technical aptitude",
        careers: ["Software Engineer", "Data Scientist", "Systems Analyst"]
      });
    }

    // High numerical + logical
    if (scores.numerical >= 60 && scores.logical >= 60) {
      courses.push({
        course: "B.Sc Mathematics / Statistics",
        branches: ["Applied Mathematics", "Statistics", "Data Science"],
        reason: "Strong numerical and logical skills",
        careers: ["Data Analyst", "Actuary", "Research Scientist"]
      });
    }

    // High creative score
    if (scores.creative >= 60) {
      courses.push({
        course: "B.Des / B.F.A",
        branches: ["Graphic Design", "UI/UX Design", "Animation", "Fine Arts"],
        reason: "High creative aptitude",
        careers: ["Designer", "Art Director", "Creative Lead"]
      });
    }

    // High verbal score
    if (scores.verbal >= 60) {
      courses.push({
        course: "B.A / BA LLB",
        branches: ["English", "Journalism", "Law", "Mass Communication"],
        reason: "Strong verbal ability",
        careers: ["Journalist", "Lawyer", "Content Writer", "PR Manager"]
      });
    }

    // Balanced scores - Business/Management
    if (scores.numerical >= 50 && scores.verbal >= 50 && scores.logical >= 50) {
      courses.push({
        course: "BBA / B.Com",
        branches: ["Business Administration", "Finance", "Marketing", "Accounting"],
        reason: "Well-rounded aptitude for business",
        careers: ["Business Analyst", "Marketing Manager", "Financial Analyst"]
      });
    }

    // Default recommendations if no strong scores
    if (courses.length === 0) {
      courses.push({
        course: "Bachelor's Degree",
        branches: ["Based on your interests"],
        reason: "Take the quiz to get personalized recommendations",
        careers: ["Various career paths available"]
      });
    }

    return courses;
  };

  const courseRecommendations = getCourseRecommendations();

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
            Recommended Courses & Branches
          </h1>
          <p className="text-muted-foreground mt-2">
            Personalized course suggestions based on your profile and quiz results
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !hasQuizResults ? (
          <Card className="border-primary/20">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Take the Quiz First</h2>
              <p className="text-muted-foreground mb-6">
                Please take the Aptitude Quiz to get personalized course and branch recommendations.
              </p>
              <Button asChild>
                <Link to="/quiz">Take Aptitude Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Course Recommendations */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Recommended Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courseRecommendations.map((rec, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow border-primary/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{rec.course}</CardTitle>
                        <Badge variant="secondary" className="shrink-0">
                          <Target className="h-3 w-3 mr-1" />
                          Best Match
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        {rec.reason}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recommended Branches:</h4>
                        <div className="flex flex-wrap gap-2">
                          {rec.branches.map((branch, i) => (
                            <Badge key={i} variant="outline">{branch}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Career Paths:</h4>
                        <div className="flex flex-wrap gap-2">
                          {rec.careers.map((career, i) => (
                            <Badge key={i} variant="secondary" className="bg-accent/10">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {career}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Career Recommendations from Quiz */}
            {recommendations.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  AI-Powered Career Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((rec, index) => (
                    <Card key={rec.id || index} className="hover:shadow-lg transition-shadow border-accent/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
                            {rec.careers?.title || 'Career Option'}
                          </CardTitle>
                          <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                            {Math.round(rec.confidence_score)}% Match
                          </Badge>
                        </div>
                        {rec.careers?.category && (
                          <CardDescription>{rec.careers.category}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {rec.careers?.description || 'A great career path based on your aptitude.'}
                        </p>
                        {rec.careers?.requirements && (
                          <div className="mt-3 pt-3 border-t">
                            <h4 className="text-xs font-medium text-muted-foreground mb-2">Requirements:</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {rec.careers.requirements}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Guidance Section */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Important Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Research entrance exams required for your target courses (JEE, NEET, CUET, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Focus on building relevant skills through online courses and certifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Explore scholarship opportunities for your preferred colleges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">Connect with alumni and professionals in your field of interest</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/careers">
                  Explore All Careers
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/recommended-colleges">
                  View Recommended Colleges
                </Link>
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <Link to="/scholarships">
                  Find Scholarships
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

export default RecommendedCourses;
