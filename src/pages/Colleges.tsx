import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Heart, MapPin, DollarSign, Star, BookOpen, ExternalLink, Building2, Award, Calendar, GraduationCap, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useColleges } from "@/hooks/useColleges";
import { useFavorites } from "@/hooks/useFavorites";


// Custom debounce hook for search
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Colleges() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState<'rating' | 'fees-low' | 'fees-high' | 'name'>("rating");
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounceValue(searchTerm, 300);

  const { 
    colleges, 
    loading, 
    loadingMore,
    totalCount, 
    hasMore,
    loadMore,
    states,
    districts,
    collegeTypes
  } = useColleges({
    pageSize: 50,
    filters: {
      state: selectedState,
      district: selectedDistrict,
      college_type: selectedType,
      search: debouncedSearch,
      sortBy: sortBy
    }
  });

  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, loadMore]);

  const toggleFavorite = async (itemId: string) => {
    if (isFavorite('college', itemId)) {
      await removeFavorite('college', itemId);
    } else {
      await addFavorite('college', itemId);
    }
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedDistrict("All");
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
            Explore {totalCount.toLocaleString()} verified colleges across India - State wise, District wise with complete admission details
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="College Type" />
              </SelectTrigger>
              <SelectContent>
                {collegeTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(val) => setSortBy(val as typeof sortBy)}>
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No colleges found</h3>
            <p className="text-muted-foreground">
              {selectedDistrict !== "All" 
                ? `No colleges found in ${selectedDistrict}. Try selecting a different district.`
                : selectedState !== "All"
                ? `No colleges found in ${selectedState}. Try selecting a different state.`
                : "Try adjusting your search or filters."
              }
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setSelectedState("All");
                setSelectedDistrict("All");
                setSelectedType("All");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{colleges.length.toLocaleString()}</span> of <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> college{totalCount !== 1 ? 's' : ''}
              </p>
              {hasMore && (
                <p className="text-sm text-muted-foreground">
                  Scroll down to load more
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((college, idx) => (
                <CollegeCard 
                  key={college.id} 
                  college={college} 
                  idx={idx}
                  isFavorite={isFavorite('college', college.id)}
                  onToggleFavorite={() => toggleFavorite(college.id)}
                />
              ))}
            </div>

            {/* Load more trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading more colleges...</span>
                  </div>
                )}
              </div>
            )}

            {!hasMore && colleges.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                You've seen all {totalCount.toLocaleString()} colleges
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Separated CollegeCard component for better performance
function CollegeCard({ 
  college, 
  idx, 
  isFavorite: isFav, 
  onToggleFavorite 
}: { 
  college: any; 
  idx: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const collegeName = college?.name || "Unknown College";
  const collegeDistrict = college?.district || "Unknown District";
  const collegeState = college?.state || "Unknown State";
  const collegeLocation = college?.location || "";

  return (
    <Card 
      className="hover:shadow-2xl hover:border-primary/50 transition-all duration-300 animate-fade-up group h-full flex flex-col"
      style={{ animationDelay: `${Math.min(idx * 0.03, 0.3)}s`, animationFillMode: 'backwards' }}
    >
      <CardContent className="pt-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
              {collegeName}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">
                {collegeDistrict !== "Unknown District" ? collegeDistrict : collegeLocation}, {collegeState}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={onToggleFavorite}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
        </div>

        {/* College Type & NAAC Badge */}
        <div className="flex flex-wrap gap-2 mb-3">
          {college?.college_type && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {college.college_type}
            </Badge>
          )}
          {college?.naac_grade && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              NAAC {college.naac_grade}
            </Badge>
          )}
          {college?.established_year && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Est. {college.established_year}
            </Badge>
          )}
        </div>

        {/* Key Info */}
        <div className="space-y-2 mb-4 flex-1">
          {college?.rating && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span className="font-semibold">{college.rating}/10</span>
              <span className="text-xs text-muted-foreground">Rating</span>
            </div>
          )}
          {college?.fees && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="font-semibold">₹{college.fees.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">per year</span>
            </div>
          )}
          {college?.courses_offered && college.courses_offered.length > 0 && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm text-muted-foreground line-clamp-1">
                {college.courses_offered.slice(0, 2).join(", ")}
                {college.courses_offered.length > 2 && ` +${college.courses_offered.length - 2} more`}
              </span>
            </div>
          )}
          {college?.affiliation && (
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
                  {collegeName}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  {collegeDistrict !== "Unknown District" && `${collegeDistrict}, `}{collegeState}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {college?.college_type && (
                    <Badge className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {college.college_type}
                    </Badge>
                  )}
                  {college?.naac_grade && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      NAAC Grade: {college.naac_grade}
                    </Badge>
                  )}
                  {college?.established_year && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Established: {college.established_year}
                    </Badge>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {college?.rating && (
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{college.rating}/10</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  )}
                  {college?.fees && (
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <DollarSign className="h-6 w-6 mx-auto mb-2 text-accent" />
                      <p className="text-2xl font-bold">₹{college.fees.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Annual Fees</p>
                    </div>
                  )}
                  {college?.courses_offered && (
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{college.courses_offered.length}</p>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </div>
                  )}
                </div>

                {/* Affiliation */}
                {college?.affiliation && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Affiliated To
                    </h4>
                    <p className="text-muted-foreground">{college.affiliation}</p>
                  </div>
                )}

                {/* Address */}
                {college?.address && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Address
                    </h4>
                    <p className="text-muted-foreground">{college.address}</p>
                  </div>
                )}

                {/* Courses */}
                {college?.courses_offered && college.courses_offered.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Courses Offered
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {college.courses_offered.map((course: string, i: number) => (
                        <Badge key={i} variant="outline">{course}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eligibility */}
                {college?.eligibility_criteria && (
                  <div>
                    <h4 className="font-semibold mb-2">Eligibility Criteria</h4>
                    <p className="text-muted-foreground">{college.eligibility_criteria}</p>
                  </div>
                )}

                {/* Contact */}
                {college?.contact_info && (
                  <div>
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <p className="text-muted-foreground">{college.contact_info}</p>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {college?.website && (
                    <Button asChild variant="outline">
                      <a href={college.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                  {college?.admission_link && (
                    <Button asChild className="bg-gradient-to-r from-primary to-accent">
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
          
          {college?.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={college.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
