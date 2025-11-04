import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Heart, Briefcase, DollarSign, MapPin, Calendar, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useVerifiedJobs } from "@/hooks/useVerifiedJobs";
import { useFavorites } from "@/hooks/useFavorites";

export default function Careers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  
  const { jobs, loading } = useVerifiedJobs();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const toggleFavorite = async (itemId: string) => {
    if (isFavorite('career', itemId)) {
      await removeFavorite('career', itemId);
    } else {
      await addFavorite('career', itemId);
    }
  };

  const locations = useMemo(() => {
    const locs = new Set<string>();
    jobs.forEach(job => {
      if (job.location) locs.add(job.location);
    });
    return ["All", ...Array.from(locs)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = selectedLocation === "All" || job.location === selectedLocation;
      return matchesSearch && matchesLocation;
    });
  }, [jobs, searchTerm, selectedLocation]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Live Job Opportunities
          </h1>
          <p className="text-muted-foreground">
            Real verified jobs posted within the last 7 days
          </p>
        </div>

        <div className="mb-6 space-y-4 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by role or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedLocation} onValueChange={setSelectedLocation}>
              <TabsList className="w-full justify-start overflow-x-auto">
                {locations.map(loc => (
                  <TabsTrigger key={loc} value={loc}>{loc}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <p className="text-sm text-muted-foreground">
                Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, idx) => (
                <Card 
                  key={job.id} 
                  className="hover:shadow-xl hover:border-primary/40 transition-all duration-300 animate-fade-up group"
                  style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'backwards' }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-gradient-to-r from-accent to-accent/80 text-white">New</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(job.id)}
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${isFavorite('career', job.id) ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </Button>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{job.role}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {job.company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{job.location}</span>
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-accent" />
                        <span className="font-medium text-accent">{job.salary_range}</span>
                      </div>
                    )}
                    {job.posting_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Posted: {new Date(job.posting_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.required_skills.slice(0, 3).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full mt-4 hover:scale-105 transition-transform"
                          variant="outline"
                          onClick={() => setSelectedJob(job)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        {selectedJob && (
                          <>
                            <DialogHeader>
                              <DialogTitle className="text-2xl flex items-center gap-2">
                                <Briefcase className="h-6 w-6 text-primary" />
                                {selectedJob.role}
                              </DialogTitle>
                              <DialogDescription className="text-base">{selectedJob.company}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Location
                                </h4>
                                <p className="text-muted-foreground">{selectedJob.location}</p>
                              </div>
                              {selectedJob.salary_range && (
                                <div>
                                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Salary Range
                                  </h4>
                                  <p className="text-muted-foreground">{selectedJob.salary_range}</p>
                                </div>
                              )}
                              {selectedJob.experience_required && (
                                <div>
                                  <h4 className="font-semibold mb-2">Experience Required</h4>
                                  <p className="text-muted-foreground">{selectedJob.experience_required}</p>
                                </div>
                              )}
                              {selectedJob.job_type && (
                                <div>
                                  <h4 className="font-semibold mb-2">Job Type</h4>
                                  <Badge>{selectedJob.job_type}</Badge>
                                </div>
                              )}
                              {selectedJob.required_skills && selectedJob.required_skills.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Required Skills</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedJob.required_skills.map((skill: string, idx: number) => (
                                      <Badge key={idx} variant="secondary">{skill}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {selectedJob.required_education && selectedJob.required_education.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Required Education</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedJob.required_education.map((edu: string, idx: number) => (
                                      <Badge key={idx} variant="outline">{edu}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground border-t pt-3">
                                <p>Source: {selectedJob.source_site}</p>
                                <p>Last verified: {new Date(selectedJob.last_checked).toLocaleDateString()}</p>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg" asChild>
                                  <a href={selectedJob.apply_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Apply Now
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => toggleFavorite(selectedJob.id)}
                                >
                                  {isFavorite('career', selectedJob.id) ? 'Saved' : 'Save Job'}
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && !loading && (
              <div className="text-center py-12 animate-fade-in">
                <p className="text-muted-foreground">No jobs match your search criteria</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
