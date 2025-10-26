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
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="space-y-6">
      {/* Explanations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Your Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {explanations.map((explanation, idx) => (
              <p key={idx} className="text-muted-foreground">{explanation}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="scholarships" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scholarships">
            <DollarSign className="h-4 w-4 mr-2" />
            Scholarships ({recommendations.scholarships.length})
          </TabsTrigger>
          <TabsTrigger value="colleges">
            <GraduationCap className="h-4 w-4 mr-2" />
            Colleges ({recommendations.colleges.length})
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <Briefcase className="h-4 w-4 mr-2" />
            Jobs ({recommendations.jobs.length})
          </TabsTrigger>
        </TabsList>

        {/* Scholarships Tab */}
        <TabsContent value="scholarships" className="space-y-4">
          {recommendations.scholarships.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No scholarships found matching your current criteria. Try broadening your preferences.
              </AlertDescription>
            </Alert>
          ) : (
            recommendations.scholarships.map((scholarship) => (
              <Card key={scholarship.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {scholarship.provider}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary">{scholarship.amount}</Badge>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-20 rounded-full ${getConfidenceColor(scholarship.confidence_score)}`}>
                          <div 
                            className="h-full rounded-full bg-primary/20"
                            style={{ width: `${scholarship.confidence_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {scholarship.confidence_score}% match
                        </span>
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
                    <Button asChild>
                      <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply Now
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={scholarship.youtube_tutorial.url} target="_blank" rel="noopener noreferrer">
                        <Youtube className="h-4 w-4 mr-2" />
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
          {recommendations.colleges.map((college) => (
            <Card key={college.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{college.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {college.city}, {college.state} {college.district && `(${college.district})`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-20 rounded-full ${getConfidenceColor(college.confidence_score)}`}>
                      <div 
                        className="h-full rounded-full bg-primary/20"
                        style={{ width: `${college.confidence_score}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {college.confidence_score}% match
                    </span>
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

                <Button asChild>
                  <a href={college.admission_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
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
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No recent job postings found. Check back soon for new opportunities.
              </AlertDescription>
            </Alert>
          ) : (
            recommendations.jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{job.role}</CardTitle>
                      <CardDescription className="mt-1">
                        {job.company} • {job.location}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary">{job.salary_range}</Badge>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-20 rounded-full ${getConfidenceColor(job.confidence_score)}`}>
                          <div 
                            className="h-full rounded-full bg-primary/20"
                            style={{ width: `${job.confidence_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {job.confidence_score}% match
                        </span>
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

                  <Button asChild>
                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
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
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Verified Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.meta.sources.map((source, idx) => (
              <Badge key={idx} variant="outline">{source}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Last updated: {new Date(data.meta.timestamp).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityRecommendations;
