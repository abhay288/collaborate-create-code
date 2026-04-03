import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Heart, Briefcase, DollarSign, MapPin, Calendar, ExternalLink, Building2, GraduationCap, Rocket, Trophy, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { usePrivateOpportunities } from "@/hooks/usePrivateOpportunities";
import { useFavorites } from "@/hooks/useFavorites";
import GovernmentOpportunities from "@/components/GovernmentOpportunities";

const TYPE_FILTERS = [
  { value: "all", label: "All", icon: Briefcase },
  { value: "job", label: "Private Jobs", icon: Building2 },
  { value: "internship", label: "Internships", icon: GraduationCap },
  { value: "hackathon", label: "Hackathons", icon: Rocket },
  { value: "competition", label: "Competitions", icon: Trophy },
  { value: "fellowship", label: "Fellowships", icon: Users },
];

export default function Careers() {
  const [activeTab, setActiveTab] = useState("government");
  const [oppTypeFilter, setOppTypeFilter] = useState("all");
  const [oppSearch, setOppSearch] = useState("");
  
  const { opportunities, loading: oppLoading } = usePrivateOpportunities();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesType = oppTypeFilter === "all" || opp.type === oppTypeFilter;
      const matchesSearch = !oppSearch ||
        opp.title.toLowerCase().includes(oppSearch.toLowerCase()) ||
        opp.organization.toLowerCase().includes(oppSearch.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [opportunities, oppTypeFilter, oppSearch]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Career Opportunities
          </h1>
          <p className="text-muted-foreground">
            Explore internships, hackathons, and government opportunities
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="government" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Government</span> Govt
            </TabsTrigger>
          </TabsList>

          {/* Private Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="space-y-4 animate-fade-up">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search opportunities..." value={oppSearch} onChange={(e) => setOppSearch(e.target.value)} className="pl-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((f) => {
                  const Icon = f.icon;
                  return (
                    <Button key={f.value} variant={oppTypeFilter === f.value ? "default" : "outline"} size="sm" onClick={() => setOppTypeFilter(f.value)} className="gap-1.5">
                      <Icon className="h-3.5 w-3.5" />{f.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {oppLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader>
                    <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Showing {filteredOpportunities.length} opportunit{filteredOpportunities.length !== 1 ? 'ies' : 'y'}</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpportunities.map((opp, idx) => (
                    <Card key={opp.id} className="hover:shadow-xl hover:border-primary/40 transition-all duration-300 animate-fade-up group" style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'backwards' }}>
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="capitalize">{opp.type}</Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {opp.type === "job" ? `Private Job • ${opp.source}` : opp.source}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight">{opp.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1"><Building2 className="h-3 w-3" />{opp.organization}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {opp.location && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /><span>{opp.location}</span></div>}
                        {opp.stipend_or_salary && <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-accent" /><span className="font-medium text-accent">{opp.stipend_or_salary}</span></div>}
                        {opp.deadline && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /><span>Deadline: {new Date(opp.deadline).toLocaleDateString()}</span></div>}
                        {opp.eligibility && <p className="text-xs text-muted-foreground line-clamp-2">{opp.eligibility}</p>}
                        {opp.skills && opp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {opp.skills.slice(0, 4).map((skill, i) => (<Badge key={i} variant="secondary" className="text-[10px]">{skill}</Badge>))}
                          </div>
                        )}
                        <Button className="w-full mt-4" asChild>
                          <a href={opp.apply_link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 mr-2" />Apply Now</a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredOpportunities.length === 0 && (
                  <div className="text-center py-12"><Rocket className="mx-auto h-12 w-12 mb-4 opacity-30" /><p className="text-muted-foreground">No opportunities match your filters</p></div>
                )}
              </>
            )}
          </TabsContent>

          {/* Government Opportunities Tab */}
          <TabsContent value="government">
            <GovernmentOpportunities />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
