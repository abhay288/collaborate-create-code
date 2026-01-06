import { useState } from "react";
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
  BookOpen,
  Filter,
  RefreshCw
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useStreamBasedRecommendations } from "@/hooks/useStreamBasedRecommendations";
import AvsarVerifiedBadge from "@/components/AvsarVerifiedBadge";
import WhyRecommended from "@/components/WhyRecommended";

const RecommendedColleges = () => {
  const { 
    profile, 
    colleges, 
    futureCourses, 
    userStream, 
    loading, 
    error,
    refreshRecommendations 
  } = useStreamBasedRecommendations();
  
  const [showFutureCourses, setShowFutureCourses] = useState(false);

  // Get stream-specific label
  const getStreamLabel = () => {
    switch (userStream) {
      case 'Computer Science':
        return { label: 'Technical / Engineering Colleges', color: 'bg-blue-500' };
      case 'Medical':
        return { label: 'Medical & Pharmacy Colleges', color: 'bg-green-500' };
      case 'Commerce':
        return { label: 'Commerce & Management Colleges', color: 'bg-orange-500' };
      case 'Arts':
        return { label: 'Arts & Humanities Colleges', color: 'bg-purple-500' };
      case 'Engineering':
        return { label: 'Engineering & Technical Colleges', color: 'bg-indigo-500' };
      default:
        return { label: 'Science & Technology Colleges', color: 'bg-teal-500' };
    }
  };

  const streamInfo = getStreamLabel();

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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Recommended Colleges
              </h1>
              <p className="text-muted-foreground mt-2">
                Stream-based college recommendations based on your profile
              </p>
            </div>
            <Button variant="outline" onClick={refreshRecommendations} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="border-destructive/50">
            <CardContent className="py-16 text-center">
              <p className="text-destructive">{error}</p>
              <Button onClick={refreshRecommendations} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* User Info Banner */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                  {/* Stream Badge */}
                  <Badge className={`${streamInfo.color} text-white`}>
                    <Filter className="h-3 w-3 mr-1" />
                    {streamInfo.label}
                  </Badge>
                  
                  {/* Location Info */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                      {profile?.preferred_district && profile?.preferred_state 
                        ? <><strong>{profile.preferred_district}</strong>, {profile.preferred_state}</>
                        : profile?.preferred_state 
                          ? <>Showing colleges in <strong>{profile.preferred_state}</strong> and nearby states</>
                          : <>Showing top colleges across India</>
                      }
                    </span>
                  </div>
                  
                  {/* Current Course */}
                  {profile?.current_course && (
                    <div className="flex items-center gap-2 sm:ml-4">
                      <BookOpen className="h-4 w-4 text-accent" />
                      <span>Studying: <strong>{profile.current_course}</strong></span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Future Courses Section */}
            {futureCourses.length > 0 && (
              <Card className="border-accent/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-accent" />
                      Recommended Future Courses
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowFutureCourses(!showFutureCourses)}
                    >
                      {showFutureCourses ? 'Hide' : 'Show'} ({futureCourses.length})
                    </Button>
                  </div>
                  <CardDescription>
                    Based on your current {profile?.current_study_level || 'education level'}
                  </CardDescription>
                </CardHeader>
                {showFutureCourses && (
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {futureCourses.map((course, index) => (
                        <div 
                          key={index}
                          className="p-3 rounded-lg border bg-gradient-to-r from-accent/5 to-primary/5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-foreground">{course.name}</h4>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {course.score}% match
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {course.reason}
                          </p>
                          {course.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {course.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Colleges Grid */}
            {colleges.length === 0 ? (
              <Card className="border-primary/20">
                <CardContent className="py-16 text-center">
                  <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Colleges Found</h2>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find {streamInfo.label.toLowerCase()} matching your criteria. 
                    Try updating your profile preferences.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button asChild variant="outline">
                      <Link to="/profile">Update Profile</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/colleges">Browse All Colleges</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {colleges.length} Colleges Found
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {colleges.map((college) => (
                    <Card key={college.id} className="hover:shadow-lg transition-shadow border-primary/10">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">
                              {college.college_name}
                            </CardTitle>
                            <AvsarVerifiedBadge className="mt-1" />
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                            {college.confidence_score}% match
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {college.district}, {college.state}
                          {college.is_user_state && (
                            <Badge variant="outline" className="ml-2 text-xs bg-primary/10">
                              Your State
                            </Badge>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* College Type */}
                        <div className="flex flex-wrap gap-1">
                          {college.specialised_in && (
                            <Badge variant="outline" className="text-xs">
                              {college.specialised_in}
                            </Badge>
                          )}
                          {college.college_type && (
                            <Badge variant="secondary" className="text-xs">
                              {college.college_type}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Rating */}
                        {college.rating && (
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-medium">{college.rating.toFixed(1)}</span>
                          </div>
                        )}
                        
                        {/* Courses */}
                        {college.courses_offered && college.courses_offered.length > 0 && (
                          <div className="flex items-start gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              {college.courses_offered.slice(0, 3).join(', ')}
                              {college.courses_offered.length > 3 && '...'}
                            </span>
                          </div>
                        )}

                        {/* Fees */}
                        {college.fees && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>₹{college.fees.toLocaleString()}/year</span>
                          </div>
                        )}
                        
                        {/* Why Recommended - Explainability Badge */}
                        {college.explanations && college.explanations.length > 0 ? (
                          <div className="pt-2 border-t border-border/50">
                            <WhyRecommended 
                              explanations={college.explanations}
                              confidenceBand={college.confidence_band}
                              confidenceScore={college.confidence_score}
                              variant="button"
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            {college.match_reason}
                          </p>
                        )}

                        {/* Action Buttons */}
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
              </>
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
