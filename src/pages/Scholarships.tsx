import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Heart, DollarSign, Calendar, CheckCircle2, AlertCircle, ExternalLink, Youtube, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVerifiedScholarships } from "@/hooks/useVerifiedScholarships";
import { useFavorites } from "@/hooks/useFavorites";

export default function Scholarships() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [sortBy, setSortBy] = useState("deadline");

  const { scholarships, loading } = useVerifiedScholarships();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const toggleFavorite = async (itemId: string) => {
    if (isFavorite('scholarship', itemId)) {
      await removeFavorite('scholarship', itemId);
    } else {
      await addFavorite('scholarship', itemId);
    }
  };

  const academicLevels = useMemo(() => {
    const levels = new Set<string>();
    scholarships.forEach(scholarship => {
      if (scholarship.target_academic_level && Array.isArray(scholarship.target_academic_level)) {
        scholarship.target_academic_level.forEach((level: string) => levels.add(level));
      }
    });
    return ["All", ...Array.from(levels)].sort();
  }, [scholarships]);

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredScholarships = useMemo(() => {
    return scholarships
      .filter(scholarship => {
        const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             scholarship.eligibility_summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = selectedLevel === "All" || 
                            (scholarship.target_academic_level && scholarship.target_academic_level.includes(selectedLevel));
        return matchesSearch && matchesLevel;
      })
      .sort((a, b) => {
        switch(sortBy) {
          case "deadline":
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          case "amount":
            const getAmount = (amt: string) => parseInt(amt.replace(/[₹,]/g, '')) || 0;
            return getAmount(b.amount) - getAmount(a.amount);
          default: return 0;
        }
      });
  }, [scholarships, searchTerm, selectedLevel, sortBy]);

  const urgentCount = filteredScholarships.filter(s => s.deadline && getDaysUntilDeadline(s.deadline) <= 30 && getDaysUntilDeadline(s.deadline) > 0).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Verified Scholarships
          </h1>
          <p className="text-muted-foreground">
            Real scholarship opportunities from NSP, UP Scholarship, Buddy4Study and more
          </p>
        </div>

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

        <div className="mb-6 space-y-4 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
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
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <p className="text-sm text-muted-foreground">
                Showing {filteredScholarships.length} scholarship{filteredScholarships.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredScholarships.map((scholarship, idx) => {
                const daysLeft = scholarship.deadline ? getDaysUntilDeadline(scholarship.deadline) : null;
                const isUrgent = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;

                return (
                  <Card 
                    key={scholarship.id} 
                    className={`hover:shadow-xl hover:border-primary/40 transition-all duration-300 animate-fade-up group ${isUrgent ? 'border-orange-500' : ''}`}
                    style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'backwards' }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {isUrgent && (
                              <Badge variant="destructive" className="text-xs animate-pulse">
                                Urgent
                              </Badge>
                            )}
                            <Badge className="bg-gradient-to-r from-accent to-accent/80 text-white font-bold">
                              {scholarship.amount}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">{scholarship.name}</CardTitle>
                          <CardDescription className="text-sm mt-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {scholarship.provider}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(scholarship.id)}
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors ${isFavorite('scholarship', scholarship.id) ? 'fill-red-500 text-red-500' : ''}`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Eligibility</h4>
                        <p className="text-sm text-muted-foreground">{scholarship.eligibility_summary}</p>
                      </div>

                      {scholarship.deadline && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={isUrgent ? 'text-orange-600 font-medium' : ''}>
                              {daysLeft !== null && daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {new Date(scholarship.deadline).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}

                      {scholarship.required_documents && scholarship.required_documents.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Required Documents
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {scholarship.required_documents.slice(0, 3).map((doc: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{doc}</Badge>
                            ))}
                            {scholarship.required_documents.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{scholarship.required_documents.length - 3} more</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full hover:scale-105 transition-transform">
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
                              <Badge className="text-base bg-gradient-to-r from-accent to-accent/80 text-white">{scholarship.amount}</Badge>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Eligibility Criteria
                              </h4>
                              <p className="text-sm text-muted-foreground">{scholarship.eligibility_summary}</p>
                            </div>

                            {scholarship.target_academic_level && scholarship.target_academic_level.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Target Academic Level</h4>
                                <div className="flex flex-wrap gap-2">
                                  {scholarship.target_academic_level.map((level: string, idx: number) => (
                                    <Badge key={idx} variant="secondary">{level}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {scholarship.minimum_percentage && (
                              <div>
                                <h4 className="font-semibold mb-2">Minimum Percentage</h4>
                                <p className="text-sm text-muted-foreground">{scholarship.minimum_percentage}%</p>
                              </div>
                            )}

                            {scholarship.income_criteria && (
                              <div>
                                <h4 className="font-semibold mb-2">Income Criteria</h4>
                                <p className="text-sm text-muted-foreground">{scholarship.income_criteria}</p>
                              </div>
                            )}

                            {scholarship.required_documents && scholarship.required_documents.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Required Documents
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {scholarship.required_documents.map((doc: string, idx: number) => (
                                    <Badge key={idx} variant="outline">{doc}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {scholarship.deadline && (
                              <div className="flex items-center gap-2 text-sm p-3 bg-muted rounded-lg">
                                <Calendar className="h-4 w-4" />
                                <span>Application Deadline: <strong>{new Date(scholarship.deadline).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}</strong></span>
                                {daysLeft !== null && daysLeft > 0 && (
                                  <Badge variant={isUrgent ? "destructive" : "secondary"}>
                                    {daysLeft} days left
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-3 pt-2">
                              <Button className="flex-1 hover:scale-105 transition-transform bg-gradient-to-r from-primary to-accent hover:shadow-lg" asChild>
                                <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Apply Now
                                </a>
                              </Button>
                              {scholarship.youtube_tutorial_url && (
                                <Button variant="outline" className="flex-1 hover:scale-105 transition-transform" asChild>
                                  <a href={scholarship.youtube_tutorial_url} target="_blank" rel="noopener noreferrer">
                                    <Youtube className="h-4 w-4 mr-2 text-red-500" />
                                    How to Apply
                                  </a>
                                </Button>
                              )}
                            </div>

                            <div className="text-xs text-muted-foreground pt-2 border-t">
                              Official Source: {scholarship.official_domain} • Last verified: {new Date(scholarship.last_checked).toLocaleDateString()}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredScholarships.length === 0 && !loading && (
              <div className="text-center py-12 animate-fade-in">
                <p className="text-muted-foreground">No scholarships match your search criteria</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
