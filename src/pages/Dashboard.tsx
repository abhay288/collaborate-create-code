import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
  Heart,
  Briefcase,
  GraduationCap,
  DollarSign,
  MapPin,
  ExternalLink,
  Star,
  Building2,
  Calendar,
  Youtube,
  BarChart3,
  Filter
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnalyticsCard from "@/components/AnalyticsCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useVerifiedJobs } from "@/hooks/useVerifiedJobs";
import { useVerifiedScholarships } from "@/hooks/useVerifiedScholarships";
import { useStreamBasedRecommendations } from "@/hooks/useStreamBasedRecommendations";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import AvsarVerifiedBadge from "@/components/AvsarVerifiedBadge";

const Dashboard = () => {
  const { user } = useAuth();
  const { analytics, loading } = useAnalytics();
  const [profile, setProfile] = useState<any>(null);
  const [latestRecommendations, setLatestRecommendations] = useState<any>(null);
  const { jobs, loading: jobsLoading } = useVerifiedJobs();
  const { 
    colleges: recommendedColleges, 
    userStream,
    loading: collegesLoading 
  } = useStreamBasedRecommendations();
  const { scholarships, loading: scholarshipsLoading } = useVerifiedScholarships();

  useEffect(() => {
    loadProfile();
    loadLatestRecommendations();
  }, [user]);

  // Real-time updates for jobs
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verified_jobs'
        },
        () => {
          console.log('Jobs updated, refreshing...');
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Real-time updates for colleges
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-colleges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'colleges'
        },
        () => {
          console.log('Colleges updated, refreshing...');
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Real-time updates for scholarships
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-scholarships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verified_scholarships'
        },
        () => {
          console.log('Scholarships updated, refreshing...');
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setProfile(data);
  };

  const loadLatestRecommendations = async () => {
    if (!user) return;

    // Get latest quiz session with career recommendations
    const { data: session } = await supabase
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

    if (session) {
      setLatestRecommendations(session.career_recommendations);
    }
  };

  const userName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const userInitials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || userName.charAt(0);

  // Calculate profile completion with new fields
  const profileFields = ['full_name', 'primary_target', 'current_study_level', 'current_course', 'target_course_interest', 'target_admission_year', 'preferred_state'];
  const completedFields = profileFields.filter(field => {
    const value = profile?.[field];
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  }).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  // Check if user needs onboarding
  const needsOnboarding = !profile?.current_study_level && !profile?.class_level;

  const stats = [
    { label: "Quizzes Taken", value: "0", icon: BookOpen, color: "text-primary" },
    { label: "Career Matches", value: "0", icon: Target, color: "text-accent" },
    { label: "Saved Colleges", value: "0", icon: Award, color: "text-secondary" },
    { label: "Applications", value: "0", icon: TrendingUp, color: "text-primary" }
  ];

  const recentActivity = [
    { action: "Account created", time: "Just now", status: "completed" }
  ];

  const nextSteps = needsOnboarding ? [
    { 
      title: "Complete Your Profile", 
      description: "Tell us about your education journey to get personalized recommendations",
      link: "/onboarding",
      icon: Target
    },
  ] : [
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-4 mb-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 shadow-lg">
            <Avatar className="h-16 w-16 ring-4 ring-primary/20 animate-pulse-glow">
              <AvatarImage src={profile?.profile_picture_url || ""} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome back, {userName}!
              </h1>
              <p className="text-muted-foreground">Let's continue your career journey ✨</p>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/my-result" className="group">
            <Card className="h-full border-primary/20 hover:border-primary/50 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">My Aptitude Result</h3>
                <p className="text-sm text-muted-foreground">View your quiz scores, skill breakdown & performance</p>
                <ArrowRight className="mt-4 h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/recommended-colleges" className="group">
            <Card className="h-full border-accent/20 hover:border-accent/50 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500/10 to-green-600/5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors mb-4">
                  <GraduationCap className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">Recommended Colleges</h3>
                <p className="text-sm text-muted-foreground">Best-fit colleges based on your profile & location</p>
                <ArrowRight className="mt-4 h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/recommended-courses" className="group">
            <Card className="h-full border-purple-500/20 hover:border-purple-500/50 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors mb-4">
                  <BookOpen className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 transition-colors">Recommended Courses</h3>
                <p className="text-sm text-muted-foreground">Course & branch suggestions based on your aptitude</p>
                <ArrowRight className="mt-4 h-5 w-5 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {!loading && (
            <>
              <div className="animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
                <AnalyticsCard
                  title="Quizzes Taken"
                  value={analytics.quizzesTaken}
                  icon={BookOpen}
                  description="Completed assessments"
                />
              </div>
              <div className="animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                <AnalyticsCard
                  title="Career Matches"
                  value={analytics.recommendationsReceived}
                  icon={Target}
                  description="AI-generated recommendations"
                />
              </div>
              <div className="animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
                <AnalyticsCard
                  title="Saved Colleges"
                  value={analytics.collegesSaved}
                  icon={Award}
                  description="In your favorites"
                />
              </div>
              <div className="animate-fade-up" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
                <AnalyticsCard
                  title="Saved Scholarships"
                  value={analytics.scholarshipsSaved}
                  icon={Heart}
                  description="Opportunities tracked"
                />
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Next Steps */}
          <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary animate-pulse" />
                  Recommended Next Steps
                </CardTitle>
                <CardDescription>Complete these actions to get the most out of Avsar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {nextSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div 
                      key={index} 
                      className="group flex items-start gap-4 p-4 rounded-lg border border-muted hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-r from-background to-muted/20"
                    >
                      <div className="mt-1 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        <Button asChild size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <Link to={step.link}>
                            Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
            <Card className="animate-fade-up border-accent/20 shadow-lg hover:shadow-xl transition-shadow" style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}>
              <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Complete your profile</span>
                      <span className="font-bold text-primary">{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
                  </div>
                  <Button asChild variant="outline" className="w-full group hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white hover:border-transparent transition-all">
                    <Link to="/profile">
                      Complete Profile 
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="animate-fade-up border-primary/20 shadow-lg" style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}>
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary animate-pulse" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-background to-muted/30 animate-fade-in">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 animate-scale-in" />
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

        {/* Recommendations Section */}
        <div className="mt-12 space-y-8">
          <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Career Opportunities
              </TabsTrigger>
              <TabsTrigger value="colleges" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Colleges
              </TabsTrigger>
              <TabsTrigger value="scholarships" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Scholarships
              </TabsTrigger>
            </TabsList>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Recommended Career Opportunities
                  </CardTitle>
                  <CardDescription>
                    Real verified job opportunities matched to your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {jobsLoading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading opportunities...</p>
                  ) : jobs.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No job opportunities available yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jobs.slice(0, 6).map((job) => (
                        <Card key={job.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground">{job.role}</h3>
                                <p className="text-sm text-muted-foreground">{job.company}</p>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                {Math.round(job.confidence_score)}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <MapPin className="inline h-3 w-3 mr-1" />
                              {job.location}
                            </p>
                            {job.salary_range && (
                              <p className="text-sm font-medium text-foreground mb-2">
                                💰 {job.salary_range}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mb-3">{job.match_reason}</p>
                            <div className="space-y-2">
                              <Button asChild size="sm" className="w-full">
                                <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                                  Apply Now
                                </a>
                              </Button>
                              <FeedbackButtons 
                                recommendationType="job" 
                                recommendationId={job.id}
                                showApplied={true}
                                className="justify-center"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colleges Tab */}
            <TabsContent value="colleges" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Recommended Colleges
                    {userStream && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {userStream} Stream
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Stream-based colleges matching your {userStream || 'academic'} background & location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {collegesLoading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading colleges...</p>
                  ) : recommendedColleges.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No colleges available yet. Complete your profile to get recommendations.</p>
                      <Button asChild variant="outline">
                        <Link to="/profile">Complete Profile</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recommendedColleges.slice(0, 6).map((college) => (
                        <Card key={college.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground line-clamp-2">{college.college_name}</h3>
                                <AvsarVerifiedBadge className="mt-1" />
                              </div>
                              <Badge variant="secondary" className="ml-2 shrink-0">
                                {college.confidence_score}% match
                              </Badge>
                            </div>
                            {college.specialised_in && (
                              <Badge variant="outline" className="mb-2 text-xs">
                                {college.specialised_in}
                              </Badge>
                            )}
                            <p className="text-sm text-muted-foreground mb-2">
                              <MapPin className="inline h-3 w-3 mr-1" />
                              {college.district}, {college.state}
                              {college.is_user_state && (
                                <Badge variant="outline" className="ml-2 text-xs bg-primary/10">Your State</Badge>
                              )}
                            </p>
                            {college.fees && (
                              <p className="text-sm font-medium text-foreground mb-2">
                                💰 ₹{college.fees.toLocaleString()}/year
                              </p>
                            )}
                            {college.rating && (
                              <p className="text-sm mb-2 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                {college.rating.toFixed(1)}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mb-3 bg-muted/50 p-2 rounded">
                              {college.match_reason}
                            </p>
                            <div className="space-y-2">
                              {college.website ? (
                                <Button asChild size="sm" className="w-full">
                                  <a href={college.website} target="_blank" rel="noopener noreferrer">
                                    Visit Website
                                  </a>
                                </Button>
                              ) : college.admission_link ? (
                                <Button asChild size="sm" className="w-full">
                                  <a href={college.admission_link} target="_blank" rel="noopener noreferrer">
                                    Apply Now
                                  </a>
                                </Button>
                              ) : null}
                              <FeedbackButtons 
                                recommendationType="college" 
                                recommendationId={college.id}
                                className="justify-center"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {recommendedColleges.length > 0 && (
                    <div className="mt-4 text-center">
                      <Button asChild variant="outline">
                        <Link to="/recommended-colleges">
                          View All Recommended Colleges
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scholarships Tab */}
            <TabsContent value="scholarships" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Available Scholarships
                  </CardTitle>
                  <CardDescription>
                    Active scholarships you're eligible for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scholarshipsLoading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading scholarships...</p>
                  ) : scholarships.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No scholarships available yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scholarships.slice(0, 6).map((scholarship) => (
                        <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-foreground">{scholarship.name}</h3>
                              <Badge variant="secondary" className="ml-2">
                                {Math.round(scholarship.confidence_score)}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{scholarship.provider}</p>
                            <p className="text-sm font-medium text-foreground mb-2">
                              💰 {scholarship.amount}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              📅 Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">{scholarship.match_reason}</p>
                            <div className="space-y-2">
                              <Button asChild size="sm" className="w-full">
                                <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer">
                                  Apply Now
                                </a>
                              </Button>
                              <FeedbackButtons 
                                recommendationType="scholarship" 
                                recommendationId={scholarship.id}
                                showApplied={true}
                                className="justify-center"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
