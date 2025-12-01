import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Heart, MapPin, DollarSign, Star, BookOpen, ExternalLink, Building2, Award, Calendar, GraduationCap } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useColleges } from "@/hooks/useColleges";
import { useFavorites } from "@/hooks/useFavorites";

export default function Colleges() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // Increased from 12 for better browsing
  
  const { colleges, loading, totalCount } = useColleges();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Show total count for debugging
  console.log(`[Colleges] Loaded ${colleges.length} colleges out of ${totalCount} total`);

  const toggleFavorite = async (itemId: string) => {
    if (isFavorite('college', itemId)) {
      await removeFavorite('college', itemId);
    } else {
      await addFavorite('college', itemId);
    }
  };

  const states = useMemo(() => {
    try {
      const safeColleges = Array.isArray(colleges) ? colleges : [];
      const stateSet = new Set<string>();
      safeColleges.forEach(college => {
        if (college?.state) stateSet.add(college.state);
      });
      return ["All", ...Array.from(stateSet)].sort();
    } catch (error) {
      console.error('Error extracting states:', error);
      return ["All"];
    }
  }, [colleges]);

  const districts = useMemo(() => {
    try {
      const safeColleges = Array.isArray(colleges) ? colleges : [];
      const districtSet = new Set<string>();
      safeColleges.forEach(college => {
        if (college?.district && (selectedState === "All" || college?.state === selectedState)) {
          districtSet.add(college.district);
        }
      });
      return ["All", ...Array.from(districtSet)].sort();
    } catch (error) {
      console.error('Error extracting districts:', error);
      return ["All"];
    }
  }, [colleges, selectedState]);

  const collegeTypes = useMemo(() => {
    try {
      const safeColleges = Array.isArray(colleges) ? colleges : [];
      const typeSet = new Set<string>();
      safeColleges.forEach(college => {
        if (college?.college_type) typeSet.add(college.college_type);
      });
      return ["All", ...Array.from(typeSet)].sort();
    } catch (error) {
      console.error('Error extracting types:', error);
      return ["All"];
    }
  }, [colleges]);

  const courses = useMemo(() => {
    try {
      const safeColleges = Array.isArray(colleges) ? colleges : [];
      const courseSet = new Set<string>();
      safeColleges.forEach(college => {
        if (Array.isArray(college?.courses_offered)) {
          college.courses_offered.forEach(course => courseSet.add(course));
        }
      });
      return ["All", ...Array.from(courseSet)].sort();
    } catch (error) {
      console.error('Error extracting courses:', error);
      return ["All"];
    }
  }, [colleges]);

  const filteredColleges = useMemo(() => {
    try {
      // Safety check: Ensure colleges is an array
      const safeColleges = Array.isArray(colleges) ? colleges : [];
      
      const filtered = safeColleges
        .filter(college => {
          // Safety checks for each property to prevent crashes
          const collegeName = college?.name?.toLowerCase() || '';
          const collegeLocation = college?.location?.toLowerCase() || '';
          const collegeDistrict = college?.district?.toLowerCase() || '';
          const collegeState = college?.state || '';
          const collegeType = college?.college_type || '';
          const coursesOffered = Array.isArray(college?.courses_offered) ? college.courses_offered : [];
          
          const matchesSearch = collegeName.includes(searchTerm.toLowerCase()) ||
                               collegeLocation.includes(searchTerm.toLowerCase()) ||
                               collegeDistrict.includes(searchTerm.toLowerCase());
          const matchesState = selectedState === "All" || collegeState === selectedState;
          const matchesDistrict = selectedDistrict === "All" || collegeDistrict === selectedDistrict;
          const matchesType = selectedType === "All" || collegeType === selectedType;
          const matchesCourse = selectedCourse === "All" || coursesOffered.includes(selectedCourse);
          
          return matchesSearch && matchesState && matchesDistrict && matchesType && matchesCourse;
        })
        .sort((a, b) => {
          try {
            switch(sortBy) {
              case "rating": 
                return (b?.rating || 0) - (a?.rating || 0);
              case "fees-low": 
                return (a?.fees || 0) - (b?.fees || 0);
              case "fees-high": 
                return (b?.fees || 0) - (a?.fees || 0);
              case "name": 
                return (a?.name || "").localeCompare(b?.name || "");
              default: 
                return 0;
            }
          } catch (error) {
            console.error('Error sorting colleges:', error);
            return 0;
          }
        });

      return filtered;
    } catch (error) {
      console.error('Error filtering colleges:', error);
      return [];
    }
  }, [colleges, searchTerm, selectedState, selectedDistrict, selectedType, selectedCourse, sortBy]);

  const paginatedColleges = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredColleges.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredColleges, currentPage]);

  const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedDistrict("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Indian Colleges Database
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore verified colleges across India - State wise, District wise with complete admission details
          </p>
        </div>

        <div className="mb-6 space-y-4 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by college name, city, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDistrict} onValueChange={(val) => { setSelectedDistrict(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={(val) => { setSelectedType(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="College Type" />
              </SelectTrigger>
              <SelectContent>
                {collegeTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCourse} onValueChange={(val) => { setSelectedCourse(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="fees-low">Fees: Low to High</SelectItem>
                <SelectItem value="fees-high">Fees: High to Low</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
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
            <div className="mb-6 flex items-center justify-between animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{paginatedColleges.length}</span> of <span className="font-semibold text-foreground">{filteredColleges.length}</span> college{filteredColleges.length !== 1 ? 's' : ''}
              </p>
              {filteredColleges.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedColleges.map((college, idx) => (
                <Card 
                  key={college.id} 
                  className="hover:shadow-2xl hover:border-primary/50 transition-all duration-300 animate-fade-up group h-full flex flex-col"
                  style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'backwards' }}
                >
                  <CardContent className="pt-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">{college.name}</h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">{college.district || college.location}, {college.state}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => toggleFavorite(college.id)}
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${isFavorite('college', college.id) ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </Button>
                    </div>

                    {/* College Type & NAAC Badge */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {college.college_type && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {college.college_type}
                        </Badge>
                      )}
                      {college.naac_grade && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          NAAC {college.naac_grade}
                        </Badge>
                      )}
                      {college.established_year && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Est. {college.established_year}
                        </Badge>
                      )}
                    </div>

                    {/* Key Info */}
                    <div className="space-y-2 mb-4 flex-1">
                      {college.rating && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          <span className="font-semibold">{college.rating}/10</span>
                          <span className="text-xs text-muted-foreground">Rating</span>
                        </div>
                      )}
                      {college.fees && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="font-semibold">₹{college.fees.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">per year</span>
                        </div>
                      )}
                      {college.courses_offered && college.courses_offered.length > 0 && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {college.courses_offered.slice(0, 2).join(", ")}
                            {college.courses_offered.length > 2 && ` +${college.courses_offered.length - 2} more`}
                          </span>
                        </div>
                      )}
                      {college.affiliation && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground line-clamp-1">{college.affiliation}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="flex-1 hover:scale-105 transition-transform bg-gradient-to-r from-primary to-accent" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              {college.name}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 text-base">
                              <MapPin className="h-4 w-4" />
                              {college.district && `${college.district}, `}{college.state}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                              {college.college_type && (
                                <Badge className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {college.college_type}
                                </Badge>
                              )}
                              {college.naac_grade && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  NAAC Grade: {college.naac_grade}
                                </Badge>
                              )}
                              {college.established_year && (
                                <Badge variant="outline">Established: {college.established_year}</Badge>
                              )}
                            </div>

                            {/* Description */}
                            {college.description && (
                              <div>
                                <h4 className="font-semibold text-lg mb-2">About</h4>
                                <p className="text-muted-foreground leading-relaxed">{college.description}</p>
                              </div>
                            )}

                            {/* Key Information Grid */}
                            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                              {college.rating && (
                                <div className="flex items-center gap-3">
                                  <Star className="h-5 w-5 text-yellow-500" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Rating</p>
                                    <p className="font-semibold">{college.rating}/10</p>
                                  </div>
                                </div>
                              )}
                              {college.fees && (
                                <div className="flex items-center gap-3">
                                  <DollarSign className="h-5 w-5 text-accent" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Annual Fees</p>
                                    <p className="font-semibold">₹{college.fees.toLocaleString()}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Affiliation */}
                            {college.affiliation && (
                              <div>
                                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                  <GraduationCap className="h-5 w-5" />
                                  Affiliation
                                </h4>
                                <p className="text-muted-foreground">{college.affiliation}</p>
                              </div>
                            )}

                            {/* Courses Offered */}
                            {college.courses_offered && college.courses_offered.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                  <BookOpen className="h-5 w-5" />
                                  Courses Offered ({college.courses_offered.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {college.courses_offered.map((course: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-sm">{course}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Eligibility Criteria */}
                            {college.eligibility_criteria && (
                              <div>
                                <h4 className="font-semibold text-lg mb-2">Eligibility Criteria</h4>
                                <p className="text-muted-foreground leading-relaxed">{college.eligibility_criteria}</p>
                              </div>
                            )}

                            {/* Cutoff Scores */}
                            {college.cutoff_scores && (
                              <div>
                                <h4 className="font-semibold text-lg mb-2">Cutoff Information</h4>
                                <div className="bg-muted p-4 rounded-lg">
                                  <pre className="text-sm overflow-x-auto">{JSON.stringify(college.cutoff_scores, null, 2)}</pre>
                                </div>
                              </div>
                            )}

                            {/* Contact Information */}
                            {college.contact_info && (
                              <div>
                                <h4 className="font-semibold text-lg mb-2">Contact Information</h4>
                                <p className="text-muted-foreground">{college.contact_info}</p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                              {college.website && (
                                <Button className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg" asChild>
                                  <a href={college.website} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Official Website
                                  </a>
                                </Button>
                              )}
                              {college.admission_link && (
                                <Button variant="outline" className="flex-1 hover:bg-accent hover:text-accent-foreground" asChild>
                                  <a href={college.admission_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Apply for Admission
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredColleges.length === 0 && !loading && (
              <div className="text-center py-16 animate-fade-in">
                <div className="text-6xl mb-4">🎓</div>
                <p className="text-lg text-muted-foreground mb-2">No colleges found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search criteria</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 animate-fade-up">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
