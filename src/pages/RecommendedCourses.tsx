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
  CheckCircle2,
  AlertCircle
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

  // Generate FUTURE course recommendations based on profile and scores
  // DO NOT recommend the current studying course
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

    const currentCourse = profile.current_course?.toLowerCase() || '';
    const currentLevel = profile.current_study_level?.toLowerCase() || '';
    const studyArea = profile.study_area?.toLowerCase() || '';

    // Helper to check if already studying this
    const isCurrentCourse = (course: string) => {
      const c = course.toLowerCase();
      return currentCourse.includes(c) || c.includes(currentCourse);
    };

    // 12th Science students - recommend B.Tech, MBBS, B.Sc
    if (currentLevel.includes('12') && (studyArea === 'science' || currentCourse.includes('pcm') || currentCourse.includes('pcb'))) {
      if (scores.technical >= 50 || scores.numerical >= 50) {
        courses.push({
          course: "B.Tech / B.E.",
          branches: ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"],
          reason: "Strong technical and numerical aptitude for engineering",
          careers: ["Software Engineer", "Data Scientist", "Systems Analyst", "IoT Developer"],
          entranceExams: ["JEE Main", "JEE Advanced", "State CETs"]
        });
      }
      if (scores.verbal >= 50 || currentCourse.includes('pcb')) {
        courses.push({
          course: "MBBS / BDS / BAMS",
          branches: ["Medicine", "Dental Surgery", "Ayurveda", "Pharmacy"],
          reason: "Science background suitable for medical studies",
          careers: ["Doctor", "Surgeon", "Dentist", "Medical Researcher"],
          entranceExams: ["NEET UG", "AIIMS"]
        });
      }
      courses.push({
        course: "B.Sc",
        branches: ["Physics", "Chemistry", "Mathematics", "Biology", "Data Science"],
        reason: "Foundation for research and higher studies",
        careers: ["Research Scientist", "Lab Analyst", "Data Analyst"],
        entranceExams: ["CUET", "University Entrance Tests"]
      });
    }

    // 12th Commerce students - recommend BBA, B.Com, CA
    if (currentLevel.includes('12') && (studyArea === 'commerce' || currentCourse.includes('commerce'))) {
      courses.push({
        course: "BBA / B.Com",
        branches: ["Business Administration", "Finance", "Marketing", "Accounting"],
        reason: "Commerce background ideal for business studies",
        careers: ["Business Analyst", "Financial Analyst", "Marketing Manager"],
        entranceExams: ["CUET", "IPMAT", "SET"]
      });
      courses.push({
        course: "CA / CMA / CS",
        branches: ["Chartered Accountancy", "Cost Accounting", "Company Secretary"],
        reason: "Professional certifications for accounting careers",
        careers: ["Chartered Accountant", "Cost Accountant", "Company Secretary"],
        entranceExams: ["CA Foundation", "CMA Foundation"]
      });
    }

    // 12th Arts students - recommend BA, Law, Design
    if (currentLevel.includes('12') && (studyArea === 'arts' || currentCourse.includes('arts') || currentCourse.includes('humanities'))) {
      if (scores.verbal >= 50) {
        courses.push({
          course: "BA LLB / LLB",
          branches: ["Constitutional Law", "Corporate Law", "Criminal Law"],
          reason: "Strong verbal skills for law studies",
          careers: ["Lawyer", "Legal Advisor", "Judge", "Legal Consultant"],
          entranceExams: ["CLAT", "AILET", "LSAT"]
        });
      }
      if (scores.creative >= 50) {
        courses.push({
          course: "B.Des / B.F.A",
          branches: ["Graphic Design", "UI/UX Design", "Animation", "Fine Arts"],
          reason: "High creative aptitude for design careers",
          careers: ["Designer", "Art Director", "Animator", "Creative Lead"],
          entranceExams: ["NID DAT", "NIFT", "UCEED"]
        });
      }
      courses.push({
        course: "BA / BJMC",
        branches: ["English", "Journalism", "Mass Communication", "Psychology"],
        reason: "Arts background for humanities and media",
        careers: ["Journalist", "Content Writer", "PR Manager", "Psychologist"],
        entranceExams: ["CUET", "IIMC Entrance"]
      });
    }

    // Diploma students - recommend lateral entry B.Tech
    if (currentLevel.includes('diploma') || currentCourse.includes('diploma') || currentCourse.includes('iti')) {
      courses.push({
        course: "B.Tech (Lateral Entry)",
        branches: ["Computer Science", "Mechanical", "Electrical", "Civil"],
        reason: "Diploma qualifies for direct 2nd year B.Tech admission",
        careers: ["Engineer", "Technical Manager", "Consultant"],
        entranceExams: ["LEET", "State Polytechnic Exams"]
      });
    }

    // UG students - recommend PG programs
    if (currentLevel.includes('ug') || currentLevel.includes('graduation')) {
      if (scores.technical >= 50 && !isCurrentCourse('mtech')) {
        courses.push({
          course: "M.Tech / M.E.",
          branches: ["AI/ML", "Data Science", "Cybersecurity", "Cloud Computing"],
          reason: "Technical aptitude for advanced engineering studies",
          careers: ["Senior Engineer", "Tech Lead", "Research Scientist"],
          entranceExams: ["GATE", "University Tests"]
        });
      }
      if (scores.numerical >= 50 || scores.logical >= 50) {
        courses.push({
          course: "MBA",
          branches: ["Finance", "Marketing", "Operations", "HR", "Analytics"],
          reason: "Business management for leadership roles",
          careers: ["Business Manager", "Consultant", "Entrepreneur"],
          entranceExams: ["CAT", "XAT", "GMAT", "MAT"]
        });
      }
      if (!isCurrentCourse('mca')) {
        courses.push({
          course: "MCA",
          branches: ["Software Development", "Data Science", "Cloud Computing"],
          reason: "Computer applications for IT careers",
          careers: ["Software Developer", "System Analyst", "IT Manager"],
          entranceExams: ["NIMCET", "University Entrance"]
        });
      }
    }

    // Based on aptitude scores regardless of current level
    if (scores.technical >= 70 && courses.length < 5) {
      courses.push({
        course: "B.Tech / B.E. (Recommended)",
        branches: ["Computer Science", "AI/ML", "Data Science", "Cybersecurity"],
        reason: "Exceptional technical aptitude",
        careers: ["Software Engineer", "Data Scientist", "AI Engineer"],
        entranceExams: ["JEE Main", "State CETs"]
      });
    }

    if (scores.creative >= 70 && courses.length < 5) {
      courses.push({
        course: "Design Programs",
        branches: ["Graphic Design", "UI/UX", "Product Design", "Animation"],
        reason: "Strong creative thinking abilities",
        careers: ["Designer", "Creative Director", "Animator"],
        entranceExams: ["NID", "NIFT", "UCEED"]
      });
    }

    if (scores.verbal >= 70 && courses.length < 5) {
      courses.push({
        course: "Law / Journalism",
        branches: ["Constitutional Law", "Mass Communication", "Content"],
        reason: "Excellent verbal and communication skills",
        careers: ["Lawyer", "Journalist", "Content Strategist"],
        entranceExams: ["CLAT", "IIMC", "University Tests"]
      });
    }

    // Remove duplicates and filter out current course
    const uniqueCourses = courses.filter((c, i, arr) => 
      arr.findIndex(x => x.course === c.course) === i && !isCurrentCourse(c.course)
    );

    // If still no courses, provide general recommendations
    if (uniqueCourses.length === 0) {
      return [{
        course: "Take the Aptitude Quiz",
        branches: ["Personalized recommendations await"],
        reason: "Complete your profile and quiz for tailored suggestions",
        careers: ["Various career paths available"],
        entranceExams: []
      }];
    }

    return uniqueCourses.slice(0, 5); // Return top 5 recommendations
  };

  // Get entrance exam guidance based on recommendations
  const getEntranceExamGuidance = () => {
    const exams = [];
    const studyArea = profile?.study_area?.toLowerCase() || '';
    const currentLevel = profile?.current_study_level?.toLowerCase() || '';

    if (studyArea === 'science' || currentLevel.includes('12')) {
      exams.push({ name: "JEE Main/Advanced", description: "For IITs and NITs", deadline: "December-January" });
      exams.push({ name: "NEET UG", description: "For medical colleges", deadline: "May" });
    }
    if (studyArea === 'commerce') {
      exams.push({ name: "CUET", description: "Central universities", deadline: "March-April" });
      exams.push({ name: "IPMAT", description: "IIM integrated programs", deadline: "May" });
    }
    if (currentLevel.includes('ug')) {
      exams.push({ name: "GATE", description: "For M.Tech and PSUs", deadline: "September" });
      exams.push({ name: "CAT", description: "For IIMs MBA", deadline: "August" });
    }
    return exams;
  };

  const courseRecommendations = getCourseRecommendations();
  const entranceExams = getEntranceExamGuidance();

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
            Personalized FUTURE course suggestions based on your profile and quiz results
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
            {/* Current Status */}
            {profile?.current_course && (
              <Card className="border-muted bg-muted/30">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Currently studying: <strong>{profile.current_course}</strong></span>
                    <span className="text-muted-foreground">— Showing FUTURE path recommendations</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Recommendations */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Recommended Courses (Future Path)
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
                          {rec.branches.map((branch: string, i: number) => (
                            <Badge key={i} variant="outline">{branch}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Career Paths:</h4>
                        <div className="flex flex-wrap gap-2">
                          {rec.careers.map((career: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-accent/10">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {career}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {rec.entranceExams && rec.entranceExams.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Entrance Exams:</h4>
                          <p className="text-sm text-muted-foreground">
                            {rec.entranceExams.join(', ')}
                          </p>
                        </div>
                      )}
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
                          <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
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

            {/* Entrance Exam Guidance */}
            {entranceExams.length > 0 && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Important Entrance Exams
                  </CardTitle>
                  <CardDescription>Exams you should prepare for based on your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {entranceExams.map((exam, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{exam.name}</p>
                          <p className="text-sm text-muted-foreground">{exam.description}</p>
                          <p className="text-xs text-primary mt-1">Apply by: {exam.deadline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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