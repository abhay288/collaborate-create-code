import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, AlertCircle, RefreshCw, Clock, Filter, Building2, MapPin, ChevronDown, Info } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVerifiedScholarships } from "@/hooks/useVerifiedScholarships";
import { useFavorites } from "@/hooks/useFavorites";
import ScholarshipCard from "@/components/ScholarshipCard";

const ITEMS_PER_PAGE = 21; // Show 21 items (7 rows of 3)

export default function Scholarships() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedProvider, setSelectedProvider] = useState("All");
  const [sortBy, setSortBy] = useState("deadline");
  const [showPersonalized, setShowPersonalized] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const { 
    scholarships, 
    allScholarships,
    loading, 
    userProfile,
    lastUpdated,
    isPersonalized,
    matchCount,
    totalCount,
    refetch,
    togglePersonalized 
  } = useVerifiedScholarships();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const toggleFavorite = async (itemId: string) => {
    if (isFavorite('scholarship', itemId)) {
      await removeFavorite('scholarship', itemId);
    } else {
      await addFavorite('scholarship', itemId);
    }
  };

  // Extract unique academic levels
  const academicLevels = useMemo(() => {
    const levels = new Set<string>();
    const source = showPersonalized ? scholarships : allScholarships;
    source.forEach(scholarship => {
      if (scholarship.target_academic_level && Array.isArray(scholarship.target_academic_level)) {
        scholarship.target_academic_level.forEach((level: string) => levels.add(level));
      }
    });
    return ["All", ...Array.from(levels)].sort();
  }, [scholarships, allScholarships, showPersonalized]);

  // Extract unique states
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    const source = showPersonalized ? scholarships : allScholarships;
    source.forEach(scholarship => {
      if (scholarship.target_locations && Array.isArray(scholarship.target_locations)) {
        scholarship.target_locations.forEach((loc: string) => {
          if (loc && loc.toLowerCase() !== 'all' && loc.toLowerCase() !== 'india') {
            states.add(loc);
          }
        });
      }
    });
    return ["All", ...Array.from(states)].sort();
  }, [scholarships, allScholarships, showPersonalized]);

  // Determine provider type
  const getProviderType = (scholarship: typeof scholarships[0]): string => {
    const provider = scholarship.provider?.toLowerCase() || '';
    const source = scholarship.source?.toLowerCase() || '';
    const name = scholarship.name?.toLowerCase() || '';
    
    const govKeywords = ['government', 'ministry', 'national', 'central', 'state', 'pradhan mantri', 
                         'nsp', 'scholarship portal', 'department', 'welfare'];
    const ngoKeywords = ['foundation', 'trust', 'ngo', 'society', 'charitable'];
    
    if (govKeywords.some(k => provider.includes(k) || name.includes(k) || source.includes(k))) {
      return 'Government';
    }
    if (ngoKeywords.some(k => provider.includes(k) || name.includes(k))) {
      return 'NGO';
    }
    return 'Private';
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter scholarships based on all criteria
  const filteredScholarships = useMemo(() => {
    const source = showPersonalized ? scholarships : allScholarships;
    
    return source
      .filter(scholarship => {
        // Search filter
        const matchesSearch = searchTerm === "" || 
          scholarship.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scholarship.eligibility_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scholarship.provider?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Academic level filter
        const matchesLevel = selectedLevel === "All" || 
          (scholarship.target_academic_level && scholarship.target_academic_level.includes(selectedLevel));
        
        // State filter
        const matchesState = selectedState === "All" || 
          (scholarship.target_locations && scholarship.target_locations.some(loc => 
            loc?.toLowerCase() === selectedState.toLowerCase() ||
            loc?.toLowerCase() === 'all' ||
            loc?.toLowerCase() === 'india'
          ));
        
        // Provider type filter
        const matchesProvider = selectedProvider === "All" || 
          getProviderType(scholarship) === selectedProvider;
        
        return matchesSearch && matchesLevel && matchesState && matchesProvider;
      })
      .sort((a, b) => {
        switch(sortBy) {
          case "deadline":
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          case "amount":
            const getAmount = (amt: string) => parseInt(amt?.replace(/[₹,]/g, '') || '0') || 0;
            return getAmount(b.amount) - getAmount(a.amount);
          case "recent":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default: 
            return 0;
        }
      });
  }, [scholarships, allScholarships, showPersonalized, searchTerm, selectedLevel, selectedState, selectedProvider, sortBy]);

  const urgentCount = filteredScholarships.filter(s => 
    s.deadline && getDaysUntilDeadline(s.deadline) <= 30 && getDaysUntilDeadline(s.deadline) > 0
  ).length;

  // Paginated scholarships
  const paginatedScholarships = useMemo(() => {
    return filteredScholarships.slice(0, visibleCount);
  }, [filteredScholarships, visibleCount]);

  const hasMore = visibleCount < filteredScholarships.length;

  // Check if showing fallback (no personalized matches found)
  const showingFallback = showPersonalized && userProfile && !isPersonalized && matchCount === 0 && allScholarships.length > 0;

  const handlePersonalizedToggle = (checked: boolean) => {
    setShowPersonalized(checked);
    togglePersonalized(checked);
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination
  };

  const handleRefresh = async () => {
    await refetch();
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Verified Scholarships
              </h1>
              <p className="text-muted-foreground">
                Real scholarship opportunities from NSP, State Portals, Buddy4Study, NGOs and more
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Personalization Toggle */}
        {userProfile && (
          <div className="mb-6 p-4 rounded-lg bg-muted/50 border animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch 
                  id="personalized" 
                  checked={showPersonalized}
                  onCheckedChange={handlePersonalizedToggle}
                />
                <Label htmlFor="personalized" className="cursor-pointer">
                  <span className="font-medium">Show personalized scholarships</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Based on your profile: {userProfile.preferred_state || 'Any state'}, {userProfile.current_study_level || userProfile.education_level || 'Any level'}
                  </p>
                </Label>
              </div>
              <Badge variant="secondary">
                {showPersonalized ? scholarships.length : allScholarships.length} scholarships
              </Badge>
            </div>
          </div>
        )}

        {/* Fallback Notice */}
        {showingFallback && (
          <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950/20 animate-fade-up">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertDescription>
              <p className="font-medium">
                Showing all {allScholarships.length} scholarships
              </p>
              <p className="text-sm text-muted-foreground">
                No exact matches found for your profile. Explore these broader opportunities to find scholarships that might suit you.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Urgent Alert */}
        {urgentCount > 0 && (
          <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/20 animate-fade-up">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <AlertDescription>
              <p className="font-medium">
                {urgentCount} scholarship{urgentCount !== 1 ? 's' : ''} with deadline within 30 days
              </p>
              <p className="text-sm text-muted-foreground">Don't miss out on these opportunities!</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="mb-6 space-y-4 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filter & Search
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, eligibility, provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Provider Type Filter */}
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Provider Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Providers</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="NGO">NGO / Trust</SelectItem>
              </SelectContent>
            </Select>

            {/* State Filter */}
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {availableStates.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Academic Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Academic Level" />
              </SelectTrigger>
              <SelectContent>
                {academicLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Deadline (Urgent First)</SelectItem>
                <SelectItem value="amount">Amount (High to Low)</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full mb-2" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <p className="text-sm text-muted-foreground">
                Showing {filteredScholarships.length} scholarship{filteredScholarships.length !== 1 ? 's' : ''}
                {showPersonalized && userProfile && ' (personalized for you)'}
              </p>
            </div>

            {/* Scholarship Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedScholarships.map((scholarship, idx) => (
                <div 
                  key={scholarship.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(idx * 0.03, 0.2)}s`, animationFillMode: 'backwards' }}
                >
                  <ScholarshipCard
                    scholarship={scholarship}
                    isFavorite={isFavorite('scholarship', scholarship.id)}
                    onToggleFavorite={() => toggleFavorite(scholarship.id)}
                    isPersonalized={showPersonalized && userProfile !== null && isPersonalized}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-8 animate-fade-up">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={loadMore}
                  className="min-w-[200px]"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Load More ({filteredScholarships.length - visibleCount} remaining)
                </Button>
              </div>
            )}

            {/* Showing count */}
            {paginatedScholarships.length > 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Showing {paginatedScholarships.length} of {filteredScholarships.length} scholarships
                {totalCount !== filteredScholarships.length && ` (${totalCount} total available)`}
              </div>
            )}

            {/* Empty State */}
            {filteredScholarships.length === 0 && !loading && (
              <div className="text-center py-12 animate-fade-in">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-semibold mb-2">No scholarships found</h3>
                <p className="text-muted-foreground mb-4">
                  {showPersonalized 
                    ? "Try turning off personalization or adjusting your filters"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setSelectedLevel("All");
                  setSelectedState("All");
                  setSelectedProvider("All");
                  setVisibleCount(ITEMS_PER_PAGE);
                }}>
                  Clear Filters
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
