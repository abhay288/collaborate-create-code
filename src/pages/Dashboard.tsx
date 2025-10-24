import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
  Heart
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnalyticsCard from "@/components/AnalyticsCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const { analytics, loading } = useAnalytics();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setProfile(data);
  };

  const userName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const userInitials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || userName.charAt(0);

  // Calculate profile completion
  const profileFields = ['full_name', 'age', 'education_level', 'interests', 'goals'];
  const completedFields = profileFields.filter(field => profile?.[field]).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  const stats = [
    { label: "Quizzes Taken", value: "0", icon: BookOpen, color: "text-primary" },
    { label: "Career Matches", value: "0", icon: Target, color: "text-accent" },
    { label: "Saved Colleges", value: "0", icon: Award, color: "text-secondary" },
    { label: "Applications", value: "0", icon: TrendingUp, color: "text-primary" }
  ];

  const recentActivity = [
    { action: "Account created", time: "Just now", status: "completed" }
  ];

  const nextSteps = [
    { 
      title: "Take Aptitude Quiz", 
      description: "Discover your strengths and get personalized career recommendations",
      link: "/quiz",
      icon: BookOpen
    },
    { 
      title: "Explore Careers", 
      description: "Browse career paths that match your interests",
      link: "/careers",
      icon: Target
    },
    { 
      title: "Find Colleges", 
      description: "Search for colleges that fit your goals",
      link: "/colleges",
      icon: Award
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.profile_picture_url || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
              <p className="text-muted-foreground">Let's continue your career journey</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {!loading && (
            <>
              <AnalyticsCard
                title="Quizzes Taken"
                value={analytics.quizzesTaken}
                icon={BookOpen}
                description="Completed assessments"
              />
              <AnalyticsCard
                title="Career Matches"
                value={analytics.recommendationsReceived}
                icon={Target}
                description="AI-generated recommendations"
              />
              <AnalyticsCard
                title="Saved Colleges"
                value={analytics.collegesSaved}
                icon={Award}
                description="In your favorites"
              />
              <AnalyticsCard
                title="Saved Scholarships"
                value={analytics.scholarshipsSaved}
                icon={Heart}
                description="Opportunities tracked"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Next Steps */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Next Steps</CardTitle>
                <CardDescription>Complete these actions to get the most out of Avsar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {nextSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary transition-colors">
                      <div className="mt-1">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        <Button asChild size="sm" variant="outline">
                          <Link to={step.link}>
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Progress */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Complete your profile</span>
                      <span className="font-medium">{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/profile">Complete Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
