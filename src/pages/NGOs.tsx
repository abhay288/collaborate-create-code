import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Search,
  Heart,
  Users,
  GraduationCap,
  CheckCircle2,
  Globe,
  Filter
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useNGOs } from "@/hooks/useNGOs";

const FOCUS_AREA_COLORS: Record<string, string> = {
  'Remedial Learning': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  'Quality Teaching': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  'Education & Health': 'bg-green-500/20 text-green-700 border-green-500/30',
  'Mid-Day Meals': 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  'Child Rights': 'bg-red-500/20 text-red-700 border-red-500/30',
  'Girls Education': 'bg-pink-500/20 text-pink-700 border-pink-500/30',
  'Literacy': 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30',
  'Child Protection': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  'Rural Education': 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  'Rural Schools': 'bg-teal-500/20 text-teal-700 border-teal-500/30',
  'Shelter Home Education': 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
  'Teacher Development': 'bg-violet-500/20 text-violet-700 border-violet-500/30',
};

const NGOs = () => {
  const { ngos, loading } = useNGOs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Get unique focus areas and states
  const focusAreas = useMemo(() => {
    const areas = new Set(ngos.map(ngo => ngo.primary_focus));
    return Array.from(areas).sort();
  }, [ngos]);

  const allStates = useMemo(() => {
    const states = new Set<string>();
    ngos.forEach(ngo => {
      ngo.states_present?.forEach(state => states.add(state));
    });
    return Array.from(states).sort();
  }, [ngos]);

  // Filter NGOs
  const filteredNGOs = useMemo(() => {
    return ngos.filter(ngo => {
      const matchesSearch = !searchQuery || 
        ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.mission_summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.primary_focus.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFocus = !selectedFocus || ngo.primary_focus === selectedFocus;
      
      const matchesState = !selectedState || 
        ngo.states_present?.includes(selectedState);
      
      return matchesSearch && matchesFocus && matchesState;
    });
  }, [ngos, searchQuery, selectedFocus, selectedState]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <SEOHead
        title="Educational NGOs in India | AVSAR"
        description="Discover verified educational NGOs working across India. Find organizations focused on quality education, girls' education, mid-day meals, and more."
        keywords="educational NGOs India, Pratham, Teach For India, Akshaya Patra, education charity, donate education"
      />
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">Support Education</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Educational NGOs in India
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover verified organizations working to transform education across India. 
            Partner, donate, or volunteer to make a difference.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4 border-primary/20">
            <div className="text-3xl font-bold text-primary">{ngos.length}+</div>
            <div className="text-sm text-muted-foreground">Verified NGOs</div>
          </Card>
          <Card className="text-center p-4 border-accent/20">
            <div className="text-3xl font-bold text-accent">{allStates.length}+</div>
            <div className="text-sm text-muted-foreground">States Covered</div>
          </Card>
          <Card className="text-center p-4 border-green-500/20">
            <div className="text-3xl font-bold text-green-600">{focusAreas.length}+</div>
            <div className="text-sm text-muted-foreground">Focus Areas</div>
          </Card>
          <Card className="text-center p-4 border-purple-500/20">
            <div className="text-3xl font-bold text-purple-600">1M+</div>
            <div className="text-sm text-muted-foreground">Children Impacted</div>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search NGOs by name, mission, or focus area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>
            
            <Select
              value={selectedFocus || "all"}
              onValueChange={(value) => setSelectedFocus(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Focus Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Focus Areas</SelectItem>
                {focusAreas.map(focus => (
                  <SelectItem key={focus} value={focus}>
                    {focus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedState || "all"}
              onValueChange={(value) => setSelectedState(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {allStates.map(state => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedFocus || selectedState) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFocus(null);
                  setSelectedState(null);
                }}
                className="text-destructive hover:text-destructive"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active filters display */}
          {(selectedFocus || selectedState) && (
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedFocus && (
                <Badge variant="secondary" className="gap-2">
                  <GraduationCap className="h-3 w-3" />
                  {selectedFocus}
                  <button onClick={() => setSelectedFocus(null)} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {selectedState && (
                <Badge variant="secondary" className="gap-2">
                  <MapPin className="h-3 w-3" />
                  {selectedState}
                  <button onClick={() => setSelectedState(null)} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* NGO Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredNGOs.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No NGOs Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNGOs.map((ngo) => (
              <Card 
                key={ngo.id} 
                className="group hover:shadow-xl transition-all duration-300 border-primary/10 hover:border-primary/30 overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                        {ngo.name}
                        {ngo.verified && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={FOCUS_AREA_COLORS[ngo.primary_focus] || 'bg-primary/10 text-primary'}
                  >
                    {ngo.primary_focus}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {ngo.mission_summary}
                  </p>

                  {/* States Present */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {ngo.states_present?.slice(0, 4).map(state => (
                        <Badge 
                          key={state} 
                          variant="secondary" 
                          className="text-xs cursor-pointer hover:bg-primary/20"
                          onClick={() => setSelectedState(state)}
                        >
                          {state}
                        </Badge>
                      ))}
                      {ngo.states_present && ngo.states_present.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{ngo.states_present.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-sm">
                    {ngo.email && (
                      <a 
                        href={`mailto:${ngo.email}`} 
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="h-3 w-3" />
                        {ngo.email}
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild className="flex-1" size="sm">
                      <a href={ngo.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                    {ngo.apply_or_donate_link && ngo.apply_or_donate_link !== ngo.website && (
                      <Button asChild variant="outline" size="sm">
                        <a href={ngo.apply_or_donate_link} target="_blank" rel="noopener noreferrer">
                          <Heart className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
          <Users className="h-12 w-12 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Want to Add Your NGO?</h2>
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
            If you run an educational NGO and would like to be featured on AVSAR, 
            please contact us for verification and listing.
          </p>
          <Button asChild>
            <a href="/contact">Contact Us</a>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NGOs;
