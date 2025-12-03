import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  GraduationCap, 
  MapPin, 
  Star, 
  ExternalLink,
  Building2,
  DollarSign,
  BookOpen
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const RecommendedColleges = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [colleges, setColleges] = useState<any[]>([]);
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

      // Check if user has quiz results
      const { data: sessionData } = await supabase
        .from('quiz_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .limit(1)
        .single();

      setHasQuizResults(!!sessionData);

      if (profileData) {
        // Fetch colleges based on user's state preference
        const userState = profileData.preferred_state;
        
        // Define nearby states mapping
        const nearbyStatesMap: Record<string, string[]> = {
          'Maharashtra': ['Gujarat', 'Madhya Pradesh', 'Karnataka', 'Goa'],
          'Karnataka': ['Maharashtra', 'Goa', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh'],
          'Tamil Nadu': ['Karnataka', 'Kerala', 'Andhra Pradesh', 'Puducherry'],
          'Delhi': ['Haryana', 'Uttar Pradesh', 'Rajasthan'],
          'Uttar Pradesh': ['Delhi', 'Madhya Pradesh', 'Bihar', 'Rajasthan', 'Haryana'],
          'Gujarat': ['Maharashtra', 'Rajasthan', 'Madhya Pradesh'],
          'Rajasthan': ['Gujarat', 'Madhya Pradesh', 'Haryana', 'Delhi', 'Punjab'],
          'West Bengal': ['Bihar', 'Jharkhand', 'Odisha', 'Assam'],
          'Andhra Pradesh': ['Telangana', 'Karnataka', 'Tamil Nadu', 'Odisha'],
          'Telangana': ['Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Chhattisgarh'],
        };

        const nearbyStates = nearbyStatesMap[userState] || [];
        const allStates = userState ? [userState, ...nearbyStates] : [];

        let collegeQuery = supabase
          .from('colleges')
          .select('*')
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit(20);

        if (allStates.length > 0) {
          collegeQuery = collegeQuery.in('state', allStates);
        }

        const { data: collegesData } = await collegeQuery;
        
        // If no colleges found in nearby states, fetch top colleges
        if (!collegesData || collegesData.length === 0) {
          const { data: topColleges } = await supabase
            .from('colleges')
            .select('*')
            .eq('is_active', true)
            .order('rating', { ascending: false })
            .limit(20);
          
          setColleges(topColleges || []);
        } else {
          setColleges(collegesData);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
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
            Recommended Colleges
          </h1>
          <p className="text-muted-foreground mt-2">
            Colleges matched to your profile, location, and interests
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !hasQuizResults ? (
          <Card className="border-primary/20">
            <CardContent className="py-16 text-center">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Take the Quiz First</h2>
              <p className="text-muted-foreground mb-6">
                Please take the Aptitude Quiz to get personalized college recommendations.
              </p>
              <Button asChild>
                <Link to="/quiz">Take Aptitude Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* User Info Banner */}
            {profile?.preferred_state && (
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Showing colleges in <strong>{profile.preferred_state}</strong> and nearby states</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Colleges Grid */}
            {colleges.length === 0 ? (
              <Card className="border-primary/20">
                <CardContent className="py-16 text-center">
                  <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Colleges Found</h2>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find colleges matching your criteria. Try updating your profile preferences.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/colleges">Browse All Colleges</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleges.map((college) => (
                  <Card key={college.id} className="hover:shadow-lg transition-shadow border-primary/10">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">
                          {college.college_name || 'Unknown College'}
                        </CardTitle>
                        {college.rating && (
                          <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {college.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {college.district || 'Unknown'}, {college.state || 'Unknown'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {college.college_type && (
                        <Badge variant="outline" className="text-xs">
                          {college.college_type}
                        </Badge>
                      )}
                      
                      {college.courses_offered && college.courses_offered.length > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {college.courses_offered.slice(0, 3).join(', ')}
                            {college.courses_offered.length > 3 && '...'}
                          </span>
                        </div>
                      )}

                      {college.fees && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>₹{college.fees.toLocaleString()}/year</span>
                        </div>
                      )}

                      <div className="pt-2 flex gap-2">
                        {college.website && (
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <a href={college.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Website
                            </a>
                          </Button>
                        )}
                        {college.admission_link && (
                          <Button asChild size="sm" className="flex-1">
                            <a href={college.admission_link} target="_blank" rel="noopener noreferrer">
                              Apply
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* View All Button */}
            <div className="flex justify-center pt-4">
              <Button asChild variant="outline" size="lg">
                <Link to="/colleges">
                  Browse All Colleges
                  <ExternalLink className="ml-2 h-4 w-4" />
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

export default RecommendedColleges;
