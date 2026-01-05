import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Heart, MapPin, Star, BookOpen, ExternalLink, Building2, Award, Calendar, GraduationCap, Loader2, IndianRupee, RefreshCw, X } from "lucide-react";
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
    refresh,
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
    setSelectedDistrict("All"); // Reset district when state changes
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedState("All");
    setSelectedDistrict("All");
    setSelectedType("All");
    setSortBy("rating");
  };

  const hasActiveFilters = selectedState !== "All" || selectedDistrict !== "All" || selectedType !== "All" || searchTerm.trim() !== "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        {/* Header Section */}
        <div className="border-b bg-mesh-primary">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl">
              <h1 className="font-heading text-title md:text-display-sm text-foreground mb-3">
                College Database
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore <span className="font-mono font-medium text-foreground">{totalCount.toLocaleString()}</span> verified colleges across India. Filter by state, district, and type.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by college name, city, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Filter Grid */}
            <div className="flex flex-wrap gap-3">
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="College Type" />
                </SelectTrigger>
                <SelectContent>
                  {collegeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(val) => setSortBy(val as typeof sortBy)}>
                <SelectTrigger className="w-[160px] h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="fees-low">Fees: Low to High</SelectItem>
                  <SelectItem value="fees-high">Fees: High to Low</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={refresh} className="h-10 gap-2 ml-auto">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {selectedState !== "All" && (
                  <Badge variant="secondary" className="gap-1">
                    State: {selectedState}
                    <button onClick={() => setSelectedState("All")} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedDistrict !== "All" && (
                  <Badge variant="secondary" className="gap-1">
                    District: {selectedDistrict}
                    <button onClick={() => setSelectedDistrict("All")} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedType !== "All" && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {selectedType}
                    <button onClick={() => setSelectedType("All")} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">No colleges found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {selectedDistrict !== "All" 
                  ? `No colleges found in ${selectedDistrict}, ${selectedState}. Try selecting a different district.`
                  : selectedState !== "All"
                  ? `No colleges found in ${selectedState}. Try selecting a different state.`
                  : "No colleges match your current filters. Try adjusting your search criteria."
                }
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-mono font-medium text-foreground">{colleges.length.toLocaleString()}</span> of{" "}
                  <span className="font-mono font-medium text-foreground">{totalCount.toLocaleString()}</span> colleges
                </p>
              </div>

              {/* College Grid */}
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
                <div className="text-center py-8 text-muted-foreground text-sm">
                  You've viewed all {totalCount.toLocaleString()} colleges
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Separated CollegeCard component
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
  const collegeName = college?.name || college?.college_name || "Unknown College";
  const collegeDistrict = college?.district || "";
  const collegeState = college?.state || "Unknown";
  const collegeLocation = college?.location || "";

  return (
    <Card className="group h-full flex flex-col border-2 border-transparent hover:border-primary/20 transition-all duration-300">
      <CardContent className="pt-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {collegeName}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">
                {collegeDistrict && collegeDistrict !== "Unknown" ? `${collegeDistrict}, ` : ''}
                {collegeState}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-9 w-9"
            onClick={onToggleFavorite}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
            />
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {college?.college_type && (
            <Badge variant="outline" className="text-xs">
              {college.college_type}
            </Badge>
          )}
          {college?.naac_grade && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Award className="h-3 w-3" />
              NAAC {college.naac_grade}
            </Badge>
          )}
          {college?.established_year && (
            <Badge variant="outline" className="text-xs gap-1">
              <Calendar className="h-3 w-3" />
              Est. {college.established_year}
            </Badge>
          )}
        </div>

        {/* Key Info */}
        <div className="space-y-2 mb-4 flex-1">
          {college?.rating && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span className="font-medium">{college.rating}/10</span>
            </div>
          )}
          {college?.fees && (
            <div className="flex items-center gap-2 text-sm">
              <IndianRupee className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="font-medium">₹{college.fees.toLocaleString()}</span>
              <span className="text-muted-foreground text-xs">/year</span>
            </div>
          )}
          {college?.courses_offered && college.courses_offered.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground line-clamp-1">
                {college.courses_offered.slice(0, 2).join(", ")}
                {college.courses_offered.length > 2 && ` +${college.courses_offered.length - 2}`}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex-1" size="sm">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  {collegeName}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {collegeDistrict && `${collegeDistrict}, `}{collegeState}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 pt-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {college?.college_type && (
                    <Badge>{college.college_type}</Badge>
                  )}
                  {college?.naac_grade && (
                    <Badge variant="secondary">NAAC: {college.naac_grade}</Badge>
                  )}
                  {college?.established_year && (
                    <Badge variant="outline">Est. {college.established_year}</Badge>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {college?.rating && (
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Star className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                      <p className="font-mono text-xl font-semibold">{college.rating}</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  )}
                  {college?.fees && (
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <IndianRupee className="h-5 w-5 mx-auto mb-2 text-accent" />
                      <p className="font-mono text-xl font-semibold">₹{(college.fees / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">Annual Fees</p>
                    </div>
                  )}
                  {college?.courses_offered && (
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <BookOpen className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="font-mono text-xl font-semibold">{college.courses_offered.length}</p>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </div>
                  )}
                </div>

                {/* Affiliation */}
                {college?.affiliation && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Affiliated To
                    </h4>
                    <p className="text-muted-foreground">{college.affiliation}</p>
                  </div>
                )}

                {/* Courses */}
                {college?.courses_offered && college.courses_offered.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Courses Offered
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {college.courses_offered.map((course: string, i: number) => (
                        <Badge key={i} variant="outline">{course}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {college?.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={college.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Website
                      </a>
                    </Button>
                  )}
                  {college?.admission_link && (
                    <Button size="sm" asChild>
                      <a href={college.admission_link} target="_blank" rel="noopener noreferrer">
                        Apply Now
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
  );
}