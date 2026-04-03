import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from 'date-fns';
import {
  BookOpen, TrendingUp, Award, Target, ArrowRight, Clock, CheckCircle2, Heart,
  GraduationCap, DollarSign, MapPin, ExternalLink, Star, Calendar,
  BarChart3, FileText, Map, AlertTriangle, Shield, Scale, Mic, Brain, PenTool, Keyboard
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnalyticsCard from "@/components/AnalyticsCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useVerifiedScholarships } from "@/hooks/useVerifiedScholarships";
import { useStreamBasedRecommendations } from "@/hooks/useStreamBasedRecommendations";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import AvsarVerifiedBadge from "@/components/AvsarVerifiedBadge";
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";

const ResumeATSChecker = lazy(() => import("@/components/ResumeATSChecker"));

const Dashboard = () => {
  const { user } = useAuth();
  const { analytics, loading } = useAnalytics();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("colleges");
  const [latestRecommendations, setLatestRecommendations] = useState<any>(null);
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

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  };

  const loadLatestRecommendations = async () => {
    if (!user) return;
    const { data: session } = await supabase
      .from('quiz_sessions')
      .select(`*, career_recommendations:career_recommendations(*, careers(*))`)
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();
    if (session) setLatestRecommendations(session.career_recommendations);
  };

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Student";
  const userName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const userInitials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || userName.charAt(0);

  const profileFields = ['full_name', 'current_study_level', 'current_course', 'target_course_interest', 'target_admission_year', 'preferred_state', 'preferred_district'];
  const completedFields = profileFields.filter(field => {
    const value = profile?.[field];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'number') return true;
    return !!value && String(value).trim() !== '';
  }).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);
  const needsOnboarding = !profile?.current_study_level && !profile?.class_level;

  const accountCreatedTime = useMemo(() => {
    const createdAt = user?.created_at || profile?.created_at;
    if (createdAt) {
      try { return formatDistanceToNow(new Date(createdAt), { addSuffix: true }); } catch { return 'Recently'; }
    }
    return 'Recently';
  }, [user?.created_at, profile?.created_at]);

  const recentActivity: { action: string; time: string; status: string }[] = [];
  
  // Dynamic recent activity from user_activity table
  const [dynamicActivity, setDynamicActivity] = useState<{ action: string; time: string; status: string }[]>([]);
  
  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_activity')
        .select('activity_type, activity_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data && data.length > 0) {
        setDynamicActivity(data.map(a => {
          const typeLabels: Record<string, string> = {
            'quiz_completed': '📝 Quiz completed',
            'resume_analysis': '📄 Resume analyzed',
            'profile_updated': '👤 Profile updated',
            'career_roadmap': '🗺️ Career roadmap generated',
            'skill_gap_analysis': '📊 Skill gap analyzed',
            'mock_interview': '🎤 Mock interview completed',
          };
          return {
            action: typeLabels[a.activity_type] || a.activity_type.replace(/_/g, ' '),
            time: (() => { try { return formatDistanceToNow(new Date(a.created_at), { addSuffix: true }); } catch { return 'Recently'; } })(),
            status: 'completed'
          };
        }));
      }
    };
    fetchActivity();

    // Set up real-time subscription for activity
    if (!user) return;
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activity',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const allActivity = dynamicActivity.length > 0
    ? dynamicActivity
    : [{ action: "Account created", time: accountCreatedTime, status: "completed" }];

  const nextSteps = needsOnboarding ? [
    { title: "Complete Your Profile", description: "Tell us about your education journey to get personalized recommendations", link: "/onboarding", icon: Target },
  ] : [
    { title: "Take Aptitude Quiz", description: "Discover your strengths and get personalized career recommendations", link: "/quiz", icon: BookOpen },
    { title: "Explore Careers", description: "Browse career paths that match your interests", link: "/careers", icon: Target },
    { title: "Find Colleges", description: "Search for colleges that fit your goals", link: "/colleges", icon: Award },
  ];

  const aiTools = [
    { title: "Career GPS", description: "AI-powered step-by-step career navigation", icon: Map, link: "/career-roadmap", gradient: "from-primary/8 to-primary/3", iconColor: "text-primary" },
    { title: "Skill Gap Analyzer", description: "Compare your skills vs career requirements", icon: AlertTriangle, link: "/skill-gap", gradient: "from-accent/8 to-accent/3", iconColor: "text-accent" },
    { title: "Profile Strength", description: "AI profile completeness & market readiness", icon: Shield, link: "/profile-strength", gradient: "from-primary/8 to-primary/3", iconColor: "text-primary" },
    { title: "Career Risk", description: "Automation risk & future demand analysis", icon: AlertTriangle, link: "/career-risk", gradient: "from-destructive/8 to-destructive/3", iconColor: "text-destructive" },
    { title: "Career Compare", description: "Compare two careers side-by-side", icon: Scale, link: "/career-compare", gradient: "from-accent/8 to-accent/3", iconColor: "text-accent" },
    { title: "Voice Confidence", description: "Record speech & analyze interview readiness", icon: Mic, link: "/voice-confidence", gradient: "from-primary/8 to-accent/3", iconColor: "text-primary" },
    { title: "Resume Builder", description: "Build professional resume with PDF download", icon: PenTool, link: "/resume-builder", gradient: "from-accent/8 to-accent/3", iconColor: "text-accent" },
    { title: "Career Twin", description: "Discover your AI-generated career persona", icon: Brain, link: "/career-twin", gradient: "from-primary/8 to-primary/3", iconColor: "text-primary" },
    { title: "Typing Test", description: "Measure speed, accuracy & writing quality", icon: Keyboard, link: "/typing-test", gradient: "from-accent/8 to-primary/3", iconColor: "text-accent" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {/* Welcome */}
        <div className="mb-6 animate-fade-up">
          <div className="flex items-center gap-3.5 p-5 rounded-2xl bg-gradient-to-r from-primary/6 via-accent/4 to-primary/6 border border-border/50">
            <Avatar className="h-12 w-12 ring-2 ring-primary/15">
              <AvatarImage src={profile?.profile_picture_url || ""} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg font-heading">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                Hi {firstName} 
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "bottom right", display: "inline-block" }}
                >
                  👋
                </motion.span>
              </h1>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {[
            { to: "/my-result", icon: BarChart3, title: "Aptitude Result", desc: "View scores & performance", color: "primary" },
            { to: "/recommended-colleges", icon: GraduationCap, title: "Recommended Colleges", desc: "Best-fit colleges for you", color: "accent" },
            { to: "/recommended-courses", icon: BookOpen, title: "Recommended Courses", desc: "Course suggestions", color: "primary" },
          ].map(({ to, icon: Icon, title, desc, color }) => (
            <Link key={to} to={to} className="group">
              <Card className="h-full border-border/50 card-hover-premium transition-all duration-300">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-${color}/8 group-hover:bg-${color}/15 transition-colors shrink-0`}>
                    <Icon className={`h-5 w-5 text-${color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {!loading && (
            <>
              <AnalyticsCard title="Quizzes" value={analytics.quizzesTaken} icon={BookOpen} description="Completed" />
              <AnalyticsCard title="Career Matches" value={analytics.recommendationsReceived} icon={Target} description="AI-generated" />
              <AnalyticsCard title="Colleges" value={analytics.collegesSaved} icon={Award} description="Saved" />
              <AnalyticsCard title="Scholarships" value={analytics.scholarshipsSaved} icon={Heart} description="Tracked" />
            </>
          )}
        </div>

        {/* AI Tools */}
        <div className="mb-6">
          <h2 className="text-base font-heading font-bold mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full" />
            AI Career Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.link} to={tool.link} className="group">
                  <Card className={`h-full border-border/50 hover:border-primary/25 hover:shadow-md transition-all duration-300 overflow-hidden`}>
                    <div className="h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${tool.gradient} group-hover:scale-110 transition-transform shrink-0`}>
                        <Icon className={`h-5 w-5 ${tool.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors">{tool.title}</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{tool.description}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Steps */}
          <div className="lg:col-span-2">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  Next Steps
                </CardTitle>
                <CardDescription className="text-xs">Complete these to get the most out of Avsar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {nextSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="group flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/25 transition-all duration-300 hover:shadow-sm">
                      <div className="mt-0.5 p-2 rounded-lg bg-primary/8 group-hover:bg-primary/15 transition-colors shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors">{step.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                        <Button asChild size="sm" variant="outline" className="h-7 text-xs rounded-lg">
                          <Link to={step.link}>Get Started <ArrowRight className="ml-1.5 h-3 w-3" /></Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Resume ATS */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-primary" /> Resume ATS Checker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">Check how ATS-friendly your resume is.</p>
                <Button 
                  variant="outline" 
                  className="w-full h-8 text-xs rounded-lg"
                  onClick={() => {
                    setActiveTab("resume");
                    document.getElementById('dashboard-tabs')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Analyze Resume <ArrowRight className="ml-1.5 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

            {/* Profile */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-accent" /> Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-semibold text-primary">{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
                  </div>
                  <Button asChild variant="outline" className="w-full h-8 text-xs rounded-lg">
                    <Link to="/profile">Complete Profile <ArrowRight className="ml-1.5 h-3 w-3" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-primary" /> Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {allActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    <div>
                      <p className="text-xs font-medium">{activity.action}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-2.5 w-2.5" />{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-10 space-y-6" id="dashboard-tabs">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9">
              <TabsTrigger value="colleges" className="text-xs gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Colleges</TabsTrigger>
              <TabsTrigger value="scholarships" className="text-xs gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Scholarships</TabsTrigger>
              <TabsTrigger value="resume" className="text-xs gap-1.5"><FileText className="h-3.5 w-3.5" /> ATS Checker</TabsTrigger>
            </TabsList>

            <TabsContent value="colleges" className="mt-4">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="h-4 w-4" /> Recommended Colleges
                    {userStream && <Badge variant="secondary" className="ml-2 text-[10px]">{userStream}</Badge>}
                  </CardTitle>
                  <CardDescription className="text-xs">Stream-based colleges matching your background</CardDescription>
                </CardHeader>
                <CardContent>
                  {collegesLoading ? (
                    <p className="text-center py-6 text-sm text-muted-foreground">Loading colleges...</p>
                  ) : recommendedColleges.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">Complete your profile to get recommendations.</p>
                      <Button asChild variant="outline" size="sm"><Link to="/profile">Complete Profile</Link></Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {recommendedColleges.slice(0, 6).map((college) => (
                        <Card key={college.id} className="border-border/50 hover:shadow-md transition-shadow">
                          <CardContent className="p-3.5">
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-foreground line-clamp-2">{college.college_name}</h3>
                                <AvsarVerifiedBadge className="mt-0.5" />
                              </div>
                              <Badge variant="secondary" className="ml-2 shrink-0 text-[10px]">{college.confidence_score}%</Badge>
                            </div>
                            {college.specialised_in && <Badge variant="outline" className="mb-1.5 text-[10px]">{college.specialised_in}</Badge>}
                            <p className="text-xs text-muted-foreground mb-1.5">
                              <MapPin className="inline h-3 w-3 mr-0.5" />{college.district}, {college.state}
                              {college.is_user_state && <Badge variant="outline" className="ml-1.5 text-[9px] bg-primary/5">Your State</Badge>}
                            </p>
                            {college.fees && <p className="text-xs font-medium mb-1.5">💰 ₹{college.fees.toLocaleString()}/yr</p>}
                            {college.rating && <p className="text-xs mb-1.5 flex items-center gap-0.5"><Star className="h-3 w-3 fill-accent text-accent" />{college.rating.toFixed(1)}</p>}
                            <p className="text-[10px] text-muted-foreground mb-2.5 bg-muted/30 p-1.5 rounded">{college.match_reason}</p>
                            <div className="space-y-1.5">
                              {college.website ? (
                                <Button asChild size="sm" className="w-full h-7 text-xs"><a href={college.website} target="_blank" rel="noopener noreferrer">Visit Website</a></Button>
                              ) : college.admission_link ? (
                                <Button asChild size="sm" className="w-full h-7 text-xs"><a href={college.admission_link} target="_blank" rel="noopener noreferrer">Apply</a></Button>
                              ) : null}
                              <FeedbackButtons recommendationType="college" recommendationId={college.id} className="justify-center" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {recommendedColleges.length > 0 && (
                    <div className="mt-3 text-center">
                      <Button asChild variant="outline" size="sm" className="text-xs"><Link to="/recommended-colleges">View All <ExternalLink className="ml-1.5 h-3 w-3" /></Link></Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scholarships" className="mt-4">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4" /> Scholarships</CardTitle>
                  <CardDescription className="text-xs">Active scholarships you're eligible for</CardDescription>
                </CardHeader>
                <CardContent>
                  {scholarshipsLoading ? (
                    <p className="text-center py-6 text-sm text-muted-foreground">Loading...</p>
                  ) : scholarships.length === 0 ? (
                    <p className="text-center py-6 text-sm text-muted-foreground">No scholarships available yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {scholarships.slice(0, 6).map((scholarship) => (
                        <Card key={scholarship.id} className="border-border/50 hover:shadow-md transition-shadow">
                          <CardContent className="p-3.5">
                            <div className="flex justify-between items-start mb-1.5">
                              <h3 className="text-sm font-semibold">{scholarship.name}</h3>
                              <Badge variant="secondary" className="ml-2 text-[10px]">Scholarship</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1.5">{scholarship.provider}</p>
                            <p className="text-xs font-medium mb-1.5">💰 {scholarship.amount}</p>
                            {scholarship.deadline && <p className="text-xs text-muted-foreground mb-1.5">📅 {new Date(scholarship.deadline).toLocaleDateString()}</p>}
                            <p className="text-[10px] text-muted-foreground mb-2.5">{scholarship.eligibility_summary}</p>
                            <div className="space-y-1.5">
                              <Button asChild size="sm" className="w-full h-7 text-xs"><a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer">Apply Now</a></Button>
                              <FeedbackButtons recommendationType="scholarship" recommendationId={scholarship.id} showApplied={true} className="justify-center" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resume" className="mt-4">
              <Suspense fallback={<div className="text-center py-6 text-sm">Loading ATS Checker...</div>}>
                <ResumeATSChecker />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
