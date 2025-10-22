import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Heart, TrendingUp, Briefcase, DollarSign, GraduationCap, MapPin } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const careers = [
  {
    id: 1,
    title: "Software Engineer",
    category: "Technology",
    match: 92,
    description: "Design, develop, and maintain software applications and systems using various programming languages and frameworks.",
    salary: "$80k - $150k",
    growth: "High",
    education: "Bachelor's in Computer Science",
    skills: ["Programming", "Problem Solving", "Algorithms", "System Design"],
    industries: ["Tech", "Finance", "Healthcare", "E-commerce"]
  },
  {
    id: 2,
    title: "Data Scientist",
    category: "Technology",
    match: 88,
    description: "Analyze complex data sets to extract insights and support data-driven decision making.",
    salary: "$90k - $160k",
    growth: "Very High",
    education: "Bachelor's/Master's in Data Science, Statistics",
    skills: ["Python", "Machine Learning", "Statistics", "Data Visualization"],
    industries: ["Tech", "Finance", "Healthcare", "Consulting"]
  },
  {
    id: 3,
    title: "UX/UI Designer",
    category: "Design",
    match: 85,
    description: "Create intuitive and engaging user experiences for digital products and applications.",
    salary: "$70k - $130k",
    growth: "High",
    education: "Bachelor's in Design, HCI",
    skills: ["Design Tools", "User Research", "Prototyping", "Creativity"],
    industries: ["Tech", "E-commerce", "Media", "Consulting"]
  },
  {
    id: 4,
    title: "Product Manager",
    category: "Business",
    match: 82,
    description: "Lead product development from conception to launch, working with cross-functional teams.",
    salary: "$100k - $180k",
    growth: "High",
    education: "Bachelor's in Business, Engineering",
    skills: ["Strategy", "Communication", "Analysis", "Leadership"],
    industries: ["Tech", "Finance", "Retail", "Healthcare"]
  },
  {
    id: 5,
    title: "Marketing Manager",
    category: "Business",
    match: 79,
    description: "Develop and execute marketing strategies to promote products and services.",
    salary: "$60k - $120k",
    growth: "Medium",
    education: "Bachelor's in Marketing, Business",
    skills: ["Marketing Strategy", "Analytics", "Creativity", "Communication"],
    industries: ["Retail", "Tech", "Media", "Finance"]
  },
  {
    id: 6,
    title: "Mechanical Engineer",
    category: "Engineering",
    match: 76,
    description: "Design, analyze, and manufacture mechanical systems and devices.",
    salary: "$70k - $110k",
    growth: "Medium",
    education: "Bachelor's in Mechanical Engineering",
    skills: ["CAD", "Thermodynamics", "Materials Science", "Problem Solving"],
    industries: ["Manufacturing", "Automotive", "Aerospace", "Energy"]
  },
  {
    id: 7,
    title: "Financial Analyst",
    category: "Finance",
    match: 74,
    description: "Analyze financial data and market trends to guide investment decisions.",
    salary: "$65k - $120k",
    growth: "Medium",
    education: "Bachelor's in Finance, Economics",
    skills: ["Financial Modeling", "Excel", "Analysis", "Communication"],
    industries: ["Finance", "Banking", "Consulting", "Insurance"]
  },
  {
    id: 8,
    title: "Graphic Designer",
    category: "Design",
    match: 72,
    description: "Create visual content for brands, publications, and digital platforms.",
    salary: "$45k - $85k",
    growth: "Low",
    education: "Bachelor's in Graphic Design, Art",
    skills: ["Adobe Creative Suite", "Typography", "Creativity", "Branding"],
    industries: ["Media", "Advertising", "Publishing", "Tech"]
  }
];

const categories = ["All", "Technology", "Design", "Business", "Engineering", "Finance"];

export default function Careers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedCareers, setSavedCareers] = useState<number[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<typeof careers[0] | null>(null);
  const [filters, setFilters] = useState({
    minMatch: 0,
    growth: [] as string[],
    salary: [] as string[]
  });

  const toggleSave = (id: number) => {
    if (savedCareers.includes(id)) {
      setSavedCareers(savedCareers.filter(cid => cid !== id));
      toast.success("Removed from saved careers");
    } else {
      setSavedCareers([...savedCareers, id]);
      toast.success("Saved to your profile");
    }
  };

  const filteredCareers = careers
    .filter(career => {
      const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           career.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || career.category === selectedCategory;
      const matchesMinMatch = career.match >= filters.minMatch;
      return matchesSearch && matchesCategory && matchesMinMatch;
    })
    .sort((a, b) => b.match - a.match);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Career Recommendations</h1>
          <p className="text-muted-foreground">
            Explore careers that match your aptitude and interests
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search careers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Filters</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter Careers</DialogTitle>
                  <DialogDescription>Refine your career search</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Minimum Match (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.minMatch}
                      onChange={(e) => setFilters({...filters, minMatch: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCareers.length} career{filteredCareers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Career Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map(career => (
            <Card key={career.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className="text-sm">{career.match}% Match</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSave(career.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${savedCareers.includes(career.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                </div>
                <CardTitle className="text-xl">{career.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {career.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{career.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>Growth: {career.growth}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{career.education}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {career.skills.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full mt-4"
                        variant="outline"
                        onClick={() => setSelectedCareer(career)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      {selectedCareer && (
                        <>
                          <DialogHeader>
                            <div className="flex items-center justify-between">
                              <DialogTitle className="text-2xl">{selectedCareer.title}</DialogTitle>
                              <Badge className="text-base">{selectedCareer.match}% Match</Badge>
                            </div>
                            <DialogDescription>{selectedCareer.description}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Salary Range
                              </h4>
                              <p className="text-muted-foreground">{selectedCareer.salary}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Job Growth
                              </h4>
                              <p className="text-muted-foreground">{selectedCareer.growth}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Education Required
                              </h4>
                              <p className="text-muted-foreground">{selectedCareer.education}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Key Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedCareer.skills.map((skill, idx) => (
                                  <Badge key={idx} variant="secondary">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Industries
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedCareer.industries.map((industry, idx) => (
                                  <Badge key={idx} variant="outline">{industry}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button className="flex-1" onClick={() => toast.success("Exploring related colleges...")}>
                                Find Related Colleges
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => toggleSave(selectedCareer.id)}
                              >
                                {savedCareers.includes(selectedCareer.id) ? 'Saved' : 'Save Career'}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCareers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No careers match your search criteria</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
