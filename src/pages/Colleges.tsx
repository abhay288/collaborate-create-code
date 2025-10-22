import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Heart, MapPin, DollarSign, Star, Users, BookOpen, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const colleges = [
  {
    id: 1,
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    location: "Cambridge, Massachusetts",
    type: "Private",
    rating: 4.9,
    students: "11,520",
    acceptance: "4%",
    tuition: "$57,590",
    cutoff: "99.5%",
    courses: ["Computer Science", "Engineering", "Mathematics", "Physics"],
    programs: 50,
    description: "World-renowned research university known for innovation in science and technology.",
    facilities: ["Research Labs", "Innovation Centers", "Libraries", "Sports Complex"],
    applicationDeadline: "January 1, 2025"
  },
  {
    id: 2,
    name: "Stanford University",
    shortName: "Stanford",
    location: "Stanford, California",
    type: "Private",
    rating: 4.9,
    students: "17,249",
    acceptance: "4.3%",
    tuition: "$56,169",
    cutoff: "99%",
    courses: ["Engineering", "Business", "Medicine", "Law"],
    programs: 65,
    description: "Leading research university in Silicon Valley with strong entrepreneurship focus.",
    facilities: ["Innovation Labs", "Medical Centers", "Business Incubators", "Athletic Facilities"],
    applicationDeadline: "January 5, 2025"
  },
  {
    id: 3,
    name: "Carnegie Mellon University",
    shortName: "CMU",
    location: "Pittsburgh, Pennsylvania",
    type: "Private",
    rating: 4.8,
    students: "15,818",
    acceptance: "15%",
    tuition: "$59,864",
    cutoff: "98%",
    courses: ["Computer Science", "Robotics", "Business", "Drama"],
    programs: 45,
    description: "Top-tier university excelling in technology, arts, and interdisciplinary programs.",
    facilities: ["Robotics Institute", "Design Studios", "Performance Venues", "Tech Labs"],
    applicationDeadline: "January 3, 2025"
  },
  {
    id: 4,
    name: "University of California, Berkeley",
    shortName: "UC Berkeley",
    location: "Berkeley, California",
    type: "Public",
    rating: 4.7,
    students: "45,057",
    acceptance: "14%",
    tuition: "$44,115",
    cutoff: "96%",
    courses: ["Engineering", "Sciences", "Business", "Social Sciences"],
    programs: 80,
    description: "Premier public university with world-class research and diverse academic programs.",
    facilities: ["Research Centers", "Libraries", "Recreation Centers", "Innovation Hubs"],
    applicationDeadline: "November 30, 2024"
  },
  {
    id: 5,
    name: "Georgia Institute of Technology",
    shortName: "Georgia Tech",
    location: "Atlanta, Georgia",
    type: "Public",
    rating: 4.6,
    students: "40,418",
    acceptance: "21%",
    tuition: "$33,794",
    cutoff: "94%",
    courses: ["Engineering", "Computing", "Sciences", "Business"],
    programs: 55,
    description: "Leading technological university with strong engineering and computing programs.",
    facilities: ["Tech Labs", "Innovation Center", "Research Facilities", "Sports Complex"],
    applicationDeadline: "January 10, 2025"
  },
  {
    id: 6,
    name: "University of Michigan",
    shortName: "UMich",
    location: "Ann Arbor, Michigan",
    type: "Public",
    rating: 4.7,
    students: "47,907",
    acceptance: "23%",
    tuition: "$53,232",
    cutoff: "93%",
    courses: ["Engineering", "Business", "Medicine", "Arts"],
    programs: 75,
    description: "Top public university with comprehensive programs and vibrant campus life.",
    facilities: ["Medical Centers", "Business School", "Research Labs", "Athletic Facilities"],
    applicationDeadline: "February 1, 2025"
  }
];

const locations = ["All", "California", "Massachusetts", "Pennsylvania", "Georgia", "Michigan"];
const types = ["All", "Public", "Private"];

export default function Colleges() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [savedColleges, setSavedColleges] = useState<number[]>([]);
  const [compareList, setCompareList] = useState<number[]>([]);

  const toggleSave = (id: number) => {
    if (savedColleges.includes(id)) {
      setSavedColleges(savedColleges.filter(cid => cid !== id));
      toast.success("Removed from saved colleges");
    } else {
      setSavedColleges([...savedColleges, id]);
      toast.success("Saved to your profile");
    }
  };

  const toggleCompare = (id: number) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(cid => cid !== id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, id]);
      toast.success("Added to comparison");
    } else {
      toast.error("Maximum 3 colleges can be compared");
    }
  };

  const filteredColleges = colleges
    .filter(college => {
      const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           college.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = selectedLocation === "All" || college.location.includes(selectedLocation);
      const matchesType = selectedType === "All" || college.type === selectedType;
      return matchesSearch && matchesLocation && matchesType;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case "rating": return b.rating - a.rating;
        case "tuition-low": return parseInt(a.tuition.replace(/[$,]/g, '')) - parseInt(b.tuition.replace(/[$,]/g, ''));
        case "tuition-high": return parseInt(b.tuition.replace(/[$,]/g, '')) - parseInt(a.tuition.replace(/[$,]/g, ''));
        case "acceptance": return parseFloat(a.acceptance) - parseFloat(b.acceptance);
        default: return 0;
      }
    });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">College Finder</h1>
          <p className="text-muted-foreground">
            Discover colleges that align with your career goals and preferences
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
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
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="tuition-low">Tuition (Low to High)</SelectItem>
                <SelectItem value="tuition-high">Tuition (High to Low)</SelectItem>
                <SelectItem value="acceptance">Acceptance Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList>
              {types.map(type => (
                <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Compare Bar */}
        {compareList.length > 0 && (
          <Card className="mb-6 bg-primary/5 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {compareList.length} college{compareList.length !== 1 ? 's' : ''} selected for comparison
                </p>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button disabled={compareList.length < 2}>
                        Compare Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>College Comparison</DialogTitle>
                        <DialogDescription>Compare key metrics across selected colleges</DialogDescription>
                      </DialogHeader>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Metric</th>
                              {compareList.map(id => {
                                const college = colleges.find(c => c.id === id);
                                return <th key={id} className="text-left p-2">{college?.shortName}</th>;
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Rating</td>
                              {compareList.map(id => {
                                const college = colleges.find(c => c.id === id);
                                return <td key={id} className="p-2">{college?.rating} ★</td>;
                              })}
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Tuition</td>
                              {compareList.map(id => {
                                const college = colleges.find(c => c.id === id);
                                return <td key={id} className="p-2">{college?.tuition}</td>;
                              })}
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Acceptance Rate</td>
                              {compareList.map(id => {
                                const college = colleges.find(c => c.id === id);
                                return <td key={id} className="p-2">{college?.acceptance}</td>;
                              })}
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Students</td>
                              {compareList.map(id => {
                                const college = colleges.find(c => c.id === id);
                                return <td key={id} className="p-2">{college?.students}</td>;
                              })}
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-medium">Programs</td>
                              {compareList.map(id => {
                                const college = colleges.find(c => c.id === id);
                                return <td key={id} className="p-2">{college?.programs}</td>;
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={() => setCompareList([])}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredColleges.length} college{filteredColleges.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* College Cards */}
        <div className="space-y-4">
          {filteredColleges.map(college => (
            <Card key={college.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Main Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-bold">{college.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {college.location}
                          </div>
                          <Badge variant="secondary">{college.type}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSave(college.id)}
                      >
                        <Heart
                          className={`h-5 w-5 ${savedColleges.includes(college.id) ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">{college.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{college.rating}</span>
                      <span className="text-sm text-muted-foreground">Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{college.tuition}</span>
                      <span className="text-sm text-muted-foreground">/year</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{college.students}</span>
                      <span className="text-sm text-muted-foreground">students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{college.programs}</span>
                      <span className="text-sm text-muted-foreground">programs</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Badge className="justify-center">Cutoff: {college.cutoff}</Badge>
                    <Badge variant="outline" className="justify-center">
                      Acceptance: {college.acceptance}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">{college.name}</DialogTitle>
                          <DialogDescription className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {college.location}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>{college.description}</p>
                          <div>
                            <h4 className="font-semibold mb-2">Popular Courses</h4>
                            <div className="flex flex-wrap gap-2">
                              {college.courses.map((course, idx) => (
                                <Badge key={idx} variant="secondary">{course}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Facilities</h4>
                            <div className="flex flex-wrap gap-2">
                              {college.facilities.map((facility, idx) => (
                                <Badge key={idx} variant="outline">{facility}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Application Deadline: {college.applicationDeadline}</span>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button className="flex-1">Apply Now</Button>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => toggleSave(college.id)}
                            >
                              {savedColleges.includes(college.id) ? 'Saved' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      onClick={() => toggleCompare(college.id)}
                      disabled={compareList.length >= 3 && !compareList.includes(college.id)}
                    >
                      {compareList.includes(college.id) ? 'Remove' : 'Compare'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredColleges.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No colleges match your search criteria</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
