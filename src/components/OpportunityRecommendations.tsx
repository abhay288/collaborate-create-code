import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, GraduationCap, DollarSign, Briefcase, Youtube, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OpportunityRecommendationsProps {
  data: {
    meta: {
      timestamp: string;
      sources: string[];
    };
    recommendations: {
      colleges: any[];
      scholarships: any[];
      jobs: any[];
    };
    explanations: string[];
  };
}

const OpportunityRecommendations = ({ data }: OpportunityRecommendationsProps) => {
  const { recommendations, explanations } = data;

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Explanations */}
      <Card className="border-primary/20 shadow-lg animate-fade-up">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary animate-pulse" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Personalized Recommendations
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {explanations.map((explanation, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-background to-muted/30 animate-fade-in border border-primary/10"
                style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'backwards' }}
              >
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent mt-2 animate-pulse" />
                <p className="text-sm text-muted-foreground flex-1">{explanation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="scholarships" className="w-full animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
        <TabsList className="grid w-full grid-cols-3 p-1 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <TabsTrigger value="scholarships" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
            <DollarSign className="h-4 w-4 mr-2" />
            Scholarships ({recommendations.scholarships.length})
          </TabsTrigger>
          <TabsTrigger value="colleges" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
            <GraduationCap className="h-4 w-4 mr-2" />
            Colleges ({recommendations.colleges.length})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
            <Briefcase className="h-4 w-4 mr-2" />
            Jobs ({recommendations.jobs.length})
          </TabsTrigger>
        </TabsList>

        {/* Scholarships Tab */}
        <TabsContent value="scholarships" className="space-y-4">
          {recommendations.scholarships.length === 0 ? (
            <Alert className="animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No scholarships found matching your current criteria. Try broadening your preferences.
              </AlertDescription>
            </Alert>
          ) : (
            recommendations.scholarships.map((scholarship, idx) => (
              <Card 
                key={scholarship.id} 
                className="group border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'backwards' }}
              >
                <CardHeader className="bg-gradient-to-r from-background to-muted/20">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{scholarship.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-accent" />
                        {scholarship.provider}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-gradient-to-r from-accent to-accent/80 text-white font-bold text-base px-3 py-1 animate-pulse-glow">
                        {scholarship.amount}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-24 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(scholarship.confidence_score)} transition-all duration-500`}
                            style={{ width: `${scholarship.confidence_score}%` }}
                          />
                        </div>
                        <Badge variant={getConfidenceBadgeVariant(scholarship.confidence_score)} className="text-xs">
                          {scholarship.confidence_score}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{scholarship.match_reason}</p>
                    {scholarship.eligibility_uncertain && (
                      <Alert variant="destructive" className="mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Please verify eligibility criteria before applying
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Eligibility</h4>
                      <p className="text-sm text-muted-foreground">{scholarship.eligibility_summary}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Deadline</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(scholarship.deadline).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Required Documents
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {scholarship.required_documents.map((doc: string, idx: number) => (
                        <Badge key={idx} variant="outline">{doc}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button asChild className="group/btn hover:scale-105 transition-transform bg-gradient-to-r from-primary to-accent hover:shadow-lg">
                      <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2 group-hover/btn:translate-x-1 transition-transform" />
                        Apply Now
                      </a>
                    </Button>
                    <Button variant="outline" asChild className="group/btn hover:scale-105 hover:bg-accent/10 hover:border-accent transition-all">
                      <a href={scholarship.youtube_tutorial.url} target="_blank" rel="noopener noreferrer">
                        <Youtube className="h-4 w-4 mr-2 text-red-500 group-hover/btn:scale-110 transition-transform" />
                        How to Apply
                      </a>
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Official Source: {scholarship.official_domain} • Last verified: {new Date(scholarship.last_checked).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Colleges Tab */}
        <TabsContent value="colleges" className="space-y-4">
          {recommendations.colleges.map((college, idx) => (
            <Card 
              key={college.id}
              className="group border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'backwards' }}
            >
              <CardHeader className="bg-gradient-to-r from-background to-muted/20">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {college.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      📍 {college.city}, {college.state} {college.district && `(${college.district})`}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-24 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(college.confidence_score)} transition-all duration-500`}
                          style={{ width: `${college.confidence_score}%` }}
                        />
                      </div>
                      <Badge variant={getConfidenceBadgeVariant(college.confidence_score)} className="text-xs">
                        {college.confidence_score}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{college.match_reason}</p>
                
                {college.description && (
                  <p className="text-sm">{college.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Course</h4>
                    <p className="text-sm text-muted-foreground">{college.course}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Approx. Fees</h4>
                    <p className="text-sm text-muted-foreground">{college.approx_fees}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Rating</h4>
                    <p className="text-sm text-muted-foreground">{college.ranking_source}</p>
                  </div>
                </div>

                {college.cutoff_info && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Cutoff Information</h4>
                    <p className="text-sm text-muted-foreground">{college.cutoff_info}</p>
                  </div>
                )}

                <Button asChild className="group/btn hover:scale-105 transition-transform bg-gradient-to-r from-primary to-accent hover:shadow-lg">
                  <a href={college.admission_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2 group-hover/btn:translate-x-1 transition-transform" />
                    Visit Website
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          {recommendations.jobs.length === 0 ? (
            <Alert className="animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No recent job postings found. Check back soon for new opportunities.
              </AlertDescription>
            </Alert>
          ) : (
            recommendations.jobs.map((job, idx) => (
              <Card 
                key={job.id}
                className="group border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'backwards' }}
              >
                <CardHeader className="bg-gradient-to-r from-background to-muted/20">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        {job.role}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <span className="font-medium">{job.company}</span>
                        <span>•</span>
                        <span>📍 {job.location}</span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-gradient-to-r from-accent to-accent/80 text-white font-bold text-sm px-3 py-1">
                        {job.salary_range}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-24 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(job.confidence_score)} transition-all duration-500`}
                            style={{ width: `${job.confidence_score}%` }}
                          />
                        </div>
                        <Badge variant={getConfidenceBadgeVariant(job.confidence_score)} className="text-xs">
                          {job.confidence_score}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{job.match_reason}</p>

                  {job.required_skills && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Posted: {new Date(job.posting_date).toLocaleDateString()}</span>
                    <span>Source: {job.source_site}</span>
                  </div>

                  <Button asChild className="group/btn hover:scale-105 transition-transform bg-gradient-to-r from-primary to-accent hover:shadow-lg">
                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2 group-hover/btn:translate-x-1 transition-transform" />
                      Apply Now
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Data Sources */}
      <Card className="border-primary/20 shadow-lg animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Verified Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.meta.sources.map((source, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="hover:bg-primary/10 hover:border-primary/50 transition-all animate-fade-in border-primary/20"
                style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'backwards' }}
              >
                {source}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Last updated: {new Date(data.meta.timestamp).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityRecommendations;
