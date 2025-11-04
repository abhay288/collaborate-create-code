import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Heart, MapPin, DollarSign, Star, BookOpen, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useColleges } from "@/hooks/useColleges";
import { useFavorites } from "@/hooks/useFavorites";

export default function Colleges() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  
  const { colleges, loading } = useColleges();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const toggleFavorite = async (itemId: string) => {
    if (isFavorite('college', itemId)) {
      await removeFavorite('college', itemId);
    } else {
      await addFavorite('college', itemId);
    }
  };

  const states = useMemo(() => {
    const stateSet = new Set<string>();
    colleges.forEach(college => {
      if (college.state) stateSet.add(college.state);
    });
    return ["All", ...Array.from(stateSet)].sort();
  }, [colleges]);

  const filteredColleges = useMemo(() => {
    return colleges
      .filter(college => {
        const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             college.location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = selectedState === "All" || college.state === selectedState;
        return matchesSearch && matchesState;
      })
      .sort((a, b) => {
        switch(sortBy) {
          case "rating": return (b.rating || 0) - (a.rating || 0);
          case "fees-low": return (a.fees || 0) - (b.fees || 0);
          case "fees-high": return (b.fees || 0) - (a.fees || 0);
          default: return 0;
        }
      });
  }, [colleges, searchTerm, selectedState, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            College Finder
          </h1>
          <p className="text-muted-foreground">
            Discover real colleges filtered by state with verified information
          </p>
        </div>

        <div className="mb-6 space-y-4 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="fees-low">Fees (Low to High)</SelectItem>
                <SelectItem value="fees-high">Fees (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <p className="text-sm text-muted-foreground">
                Showing {filteredColleges.length} college{filteredColleges.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {filteredColleges.map((college, idx) => (
                <Card 
                  key={college.id} 
                  className="hover:shadow-xl hover:border-primary/40 transition-all duration-300 animate-fade-up group"
                  style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'backwards' }}
                >
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="md:col-span-2">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{college.name}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {college.location}, {college.state}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(college.id)}
                          >
                            <Heart
                              className={`h-5 w-5 transition-colors ${isFavorite('college', college.id) ? 'fill-red-500 text-red-500' : ''}`}
                            />
                          </Button>
                        </div>
                        {college.description && (
                          <p className="text-sm text-muted-foreground mt-3">{college.description}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        {college.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{college.rating}</span>
                            <span className="text-sm text-muted-foreground">Rating</span>
                          </div>
                        )}
                        {college.fees && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-accent" />
                            <span className="font-medium">₹{college.fees.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground">/year</span>
                          </div>
                        )}
                        {college.courses_offered && college.courses_offered.length > 0 && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{college.courses_offered.length}</span>
                            <span className="text-sm text-muted-foreground">courses</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full hover:scale-105 transition-transform bg-gradient-to-r from-primary to-accent">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">{college.name}</DialogTitle>
                              <DialogDescription className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {college.location}, {college.state}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {college.description && (
                                <p className="text-muted-foreground">{college.description}</p>
                              )}
                              
                              {college.courses_offered && college.courses_offered.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Courses Offered</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {college.courses_offered.map((course: string, idx: number) => (
                                      <Badge key={idx} variant="secondary">{course}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {college.cutoff_scores && (
                                <div>
                                  <h4 className="font-semibold mb-2">Cutoff Information</h4>
                                  <pre className="text-sm bg-muted p-3 rounded">{JSON.stringify(college.cutoff_scores, null, 2)}</pre>
                                </div>
                              )}

                              {college.contact_info && (
                                <div>
                                  <h4 className="font-semibold mb-2">Contact</h4>
                                  <p className="text-sm text-muted-foreground">{college.contact_info}</p>
                                </div>
                              )}

                              <div className="flex gap-2 pt-4">
                                {college.website && (
                                  <Button className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg" asChild>
                                    <a href={college.website} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Visit Website
                                    </a>
                                  </Button>
                                )}
                                {college.admission_link && (
                                  <Button variant="outline" className="flex-1" asChild>
                                    <a href={college.admission_link} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Apply Now
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredColleges.length === 0 && !loading && (
              <div className="text-center py-12 animate-fade-in">
                <p className="text-muted-foreground">No colleges match your search criteria</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
