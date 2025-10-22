import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Heart, DollarSign, Calendar, Award, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const scholarships = [
  {
    id: 1,
    name: "National Merit Scholarship",
    provider: "National Merit Scholarship Corporation",
    type: "Merit-Based",
    amount: "$2,500 - $50,000",
    deadline: "December 31, 2024",
    daysLeft: 45,
    category: "Academic Excellence",
    eligibility: ["High School Seniors", "GPA 3.5+", "US Citizen"],
    renewable: true,
    description: "Prestigious scholarship recognizing academic achievement and potential.",
    requirements: ["SAT/ACT scores", "Academic transcript", "Recommendation letters", "Essay"],
    applicationUrl: "https://example.com/apply"
  },
  {
    id: 2,
    name: "Tech Excellence Grant",
    provider: "Technology Foundation",
    type: "Field-Specific",
    amount: "$25,000",
    deadline: "January 15, 2025",
    daysLeft: 60,
    category: "Technology",
    eligibility: ["STEM Major", "GPA 3.0+", "Undergraduate"],
    renewable: true,
    description: "Supporting students pursuing careers in technology and innovation.",
    requirements: ["Project portfolio", "Personal statement", "Academic records", "Technical assessment"],
    applicationUrl: "https://example.com/apply"
  },
  {
    id: 3,
    name: "STEM Future Leaders",
    provider: "STEM Education Alliance",
    type: "Merit-Based",
    amount: "$30,000",
    deadline: "February 1, 2025",
    daysLeft: 77,
    category: "STEM",
    eligibility: ["STEM Major", "Women/Minorities", "GPA 3.5+"],
    renewable: true,
    description: "Empowering underrepresented groups in STEM fields.",
    requirements: ["Diversity statement", "Academic transcript", "Letters of recommendation", "Research proposal"],
    applicationUrl: "https://example.com/apply"
  },
  {
    id: 4,
    name: "Community Service Award",
    provider: "Civic Engagement Foundation",
    type: "Service-Based",
    amount: "$15,000",
    deadline: "March 15, 2025",
    daysLeft: 119,
    category: "Community Service",
    eligibility: ["All Majors", "100+ Service Hours", "Any GPA"],
    renewable: false,
    description: "Recognizing students making positive impact in their communities.",
    requirements: ["Service documentation", "Impact statement", "Recommendation from service org", "Personal essay"],
    applicationUrl: "https://example.com/apply"
  },
  {
    id: 5,
    name: "Global Education Scholarship",
    provider: "International Education Fund",
    type: "International",
    amount: "$40,000",
    deadline: "November 30, 2024",
    daysLeft: 14,
    category: "International",
    eligibility: ["International Students", "Full-time Enrollment", "GPA 3.0+"],
    renewable: true,
    description: "Supporting international students pursuing higher education.",
    requirements: ["Visa documentation", "English proficiency test", "Academic records", "Financial need statement"],
    applicationUrl: "https://example.com/apply"
  },
  {
    id: 6,
    name: "First Generation Scholar",
    provider: "Education Access Initiative",
    type: "Need-Based",
    amount: "$20,000",
    deadline: "January 31, 2025",
    daysLeft: 76,
    category: "First Generation",
    eligibility: ["First-gen College Student", "Financial Need", "GPA 2.5+"],
    renewable: true,
    description: "Supporting first-generation college students achieve their dreams.",
    requirements: ["FAFSA form", "Parent education verification", "Academic transcript", "Personal statement"],
    applicationUrl: "https://example.com/apply"
  }
];

const types = ["All", "Merit-Based", "Need-Based", "Field-Specific", "Service-Based", "International"];
const categories = ["All", "Academic Excellence", "STEM", "Technology", "Community Service", "International", "First Generation"];

export default function Scholarships() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showOnlyEligible, setShowOnlyEligible] = useState(false);
  const [savedScholarships, setSavedScholarships] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("deadline");

  const toggleSave = (id: number) => {
    if (savedScholarships.includes(id)) {
      setSavedScholarships(savedScholarships.filter(sid => sid !== id));
      toast.success("Removed from saved scholarships");
    } else {
      setSavedScholarships([...savedScholarships, id]);
      toast.success("Saved to your profile");
    }
  };

  const filteredScholarships = scholarships
    .filter(scholarship => {
      const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "All" || scholarship.type === selectedType;
      const matchesCategory = selectedCategory === "All" || scholarship.category === selectedCategory;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case "deadline": return a.daysLeft - b.daysLeft;
        case "amount": {
          const getMax = (amt: string) => parseInt(amt.split('-').pop()?.replace(/[$,]/g, '') || '0');
          return getMax(b.amount) - getMax(a.amount);
        }
        default: return 0;
      }
    });

  const urgentCount = filteredScholarships.filter(s => s.daysLeft <= 30).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Scholarship Discovery</h1>
          <p className="text-muted-foreground">
            Find financial aid opportunities that match your profile
          </p>
        </div>

        {/* Urgent Alert */}
        {urgentCount > 0 && (
          <Card className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">
                    {urgentCount} scholarship{urgentCount !== 1 ? 's' : ''} with deadline within 30 days
                  </p>
                  <p className="text-sm text-muted-foreground">Don't miss out on these opportunities!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Deadline (Urgent First)</SelectItem>
                <SelectItem value="amount">Amount (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Checkbox
                id="eligible"
                checked={showOnlyEligible}
                onCheckedChange={(checked) => setShowOnlyEligible(checked as boolean)}
              />
              <Label htmlFor="eligible" className="cursor-pointer">
                Show only eligible scholarships
              </Label>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredScholarships.length} scholarship{filteredScholarships.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Scholarship Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredScholarships.map(scholarship => (
            <Card key={scholarship.id} className={`hover:shadow-lg transition-shadow ${scholarship.daysLeft <= 30 ? 'border-orange-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {scholarship.daysLeft <= 30 && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {scholarship.type}
                      </Badge>
                      {scholarship.renewable && (
                        <Badge variant="outline" className="text-xs">
                          Renewable
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{scholarship.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {scholarship.provider}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSave(scholarship.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${savedScholarships.includes(scholarship.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{scholarship.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">{scholarship.amount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={scholarship.daysLeft <= 30 ? 'text-orange-600 font-medium' : ''}>
                          {scholarship.daysLeft} days left
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Deadline: {scholarship.deadline}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Eligibility</h4>
                    <div className="flex flex-wrap gap-2">
                      {scholarship.eligibility.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">{scholarship.name}</DialogTitle>
                        <DialogDescription>{scholarship.provider}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Badge className="text-base">{scholarship.amount}</Badge>
                          {scholarship.renewable && (
                            <Badge variant="outline" className="ml-2">Renewable</Badge>
                          )}
                        </div>
                        
                        <p>{scholarship.description}</p>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Eligibility Criteria
                          </h4>
                          <ul className="space-y-1">
                            {scholarship.eligibility.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Application Requirements</h4>
                          <ul className="space-y-1">
                            {scholarship.requirements.map((req, idx) => (
                              <li key={idx} className="text-sm flex items-center gap-2">
                                <span className="text-muted-foreground">•</span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center gap-2 text-sm p-3 bg-muted rounded-lg">
                          <Calendar className="h-4 w-4" />
                          <span>Application Deadline: <strong>{scholarship.deadline}</strong></span>
                          <Badge variant={scholarship.daysLeft <= 30 ? "destructive" : "secondary"}>
                            {scholarship.daysLeft} days left
                          </Badge>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1" asChild>
                            <a href={scholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                              Apply Now
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => toggleSave(scholarship.id)}
                          >
                            {savedScholarships.includes(scholarship.id) ? 'Saved' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No scholarships match your search criteria</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
