import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, ChevronRight, Loader2, CheckCircle2, Target, ArrowLeft, Home, RefreshCw, BookOpen, Clock, Briefcase, Code, Award, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface RoadmapStep {
  year: number;
  title: string;
  actions: string[];
  skills: string[];
  milestones: string[];
  schemes?: string[];
  courses?: string[];
}

export default function CareerRoadmapPage() {
  const { user } = useAuth();
  const [career, setCareer] = useState("");
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [targetCareer, setTargetCareer] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

  const toggleFlip = (index: number) => {
    setFlippedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  useEffect(() => {
    if (user) initializePage();
  }, [user]);

  const initializePage = () => {
    setInitialLoading(false);
  };

  // Inappropriate words blocklist
  const BLOCKED_WORDS = [
    'thief', 'chor', 'murderer', 'killer', 'terrorist', 'drug dealer',
    'smuggler', 'prostitute', 'beggar', 'scammer', 'fraudster', 'hacker',
    'assassin', 'robber', 'dacoit', 'gangster', 'pirate', 'kidnapper',
    'crime', 'criminal', 'theft', 'murder', 'illegal', 'smuggling', 'robbery',
    'snatcher', 'pickpocket', 'thieving', 'burglar', 'looter', 'gambler'
  ];

  const isInappropriate = (text: string) => {
    const lower = text.toLowerCase().trim();
    return BLOCKED_WORDS.some(word => lower.includes(word));
  };

  const generate = async () => {
    if (!career.trim()) { toast.error("Enter a target career"); return; }
    
    // Block inappropriate inputs
    if (isInappropriate(career)) {
      toast.error("Sorry, we can't provide any information about this.");
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-career-roadmap", {
        body: { targetCareer: career.trim() },
      });
      
      if (error) {
        // Handle AI-guided redirection or validation errors
        let errorMessage = "Failed to generate roadmap";
        let isGuidance = false;
        try {
          const errorBody = await error.context.json();
          if (errorBody.error) errorMessage = errorBody.error;
          if (errorBody.isGuidance) isGuidance = true;
        } catch (e) {
          errorMessage = error.message || errorMessage;
        }
        if (isGuidance) {
          toast.info(errorMessage, { duration: 8000 });
        } else {
          toast.error(errorMessage, { duration: 5000 });
        }
        setLoading(false);
        return;
      }

      setRoadmap(data.roadmap);
      setTargetCareer(data.targetCareer);
      toast.success("Roadmap generated!");
    } catch (e: any) {
      toast.error(e.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setCareer("");
    setRoadmap([]);
    setTargetCareer("");
    toast.info("Reset complete — start fresh!");
  };

  // Determine step status icons
  const getStepIcon = (index: number, total: number) => {
    if (index === 0) return <BookOpen className="h-3.5 w-3.5" />;
    if (index === total - 1) return <Briefcase className="h-3.5 w-3.5" />;
    return <Code className="h-3.5 w-3.5" />;
  };

  const getStepLevel = (index: number, total: number) => {
    if (index === 0) return "Beginner";
    if (index < total * 0.33) return "Foundation";
    if (index < total * 0.66) return "Intermediate";
    if (index === total - 1) return "Job Ready";
    return "Advanced";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Career Roadmap</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={resetAll} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Start Fresh
          </Button>
        </div>

        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Map className="h-6 w-6 text-primary" />
              Career GPS
            </CardTitle>
            <CardDescription>AI-powered step-by-step career navigation system</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. AI Engineer, Doctor, IAS Officer..."
                value={career}
                onChange={e => setCareer(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generate()}
                className="text-base h-12"
              />
              <Button onClick={generate} disabled={loading} size="lg" className="h-12 px-6">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ChevronRight className="h-4 w-4 mr-1" /> Navigate</>}
              </Button>
            </div>

            {initialLoading && (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            )}

            {/* Career GPS Visual Path */}
            {roadmap.length > 0 && (
              <div className="space-y-6">
                {/* GPS Header */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-foreground">
                      🧭 Route to: {targetCareer}
                    </h3>
                    <p className="text-sm text-muted-foreground">{roadmap.length} milestones • Estimated {roadmap.length * 1} years</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">GPS Active</Badge>
                  </div>
                </div>

                {/* Visual GPS Path */}
                <div className="relative">
                  {/* Progress bar background */}
                  <div className="hidden md:flex items-center justify-between mb-8 relative">
                    <div className="absolute inset-x-0 top-1/2 h-1 bg-muted rounded-full -translate-y-1/2" />
                    <div 
                      className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full -translate-y-1/2 transition-all duration-1000"
                      style={{ width: '100%' }}
                    />
                    {roadmap.map((step, i) => (
                      <div key={i} className="relative z-10 flex flex-col items-center" style={{ flex: 1 }}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all
                          ${i === roadmap.length - 1 
                            ? 'bg-gradient-to-br from-accent to-primary text-accent-foreground ring-4 ring-accent/20' 
                            : 'bg-gradient-to-br from-primary to-primary-glow text-primary-foreground'
                          }`}>
                          {i + 1}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1.5 text-center max-w-[80px] truncate">
                          {getStepLevel(i, roadmap.length)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Detailed Steps */}
                  <div className="relative pl-8 md:pl-0 space-y-4">
                    {/* Mobile vertical line */}
                    <div className="md:hidden absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-accent to-primary rounded-full" />
                    
                    {roadmap.map((step, i) => (
                      <div 
                        key={i} 
                        className="relative animate-fade-up perspective-1000" 
                        style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
                      >
                        {/* Mobile step indicator */}
                        <div className="md:hidden absolute -left-8 top-4 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg z-10">
                          {i + 1}
                        </div>
                        
                        <div 
                          className={`relative transition-all duration-500 preserve-3d cursor-pointer ${flippedIndices.includes(i) ? 'rotate-y-180' : ''}`}
                          onClick={() => toggleFlip(i)}
                          style={{ minHeight: '300px' }}
                        >
                          {/* Front Side */}
                          <div className="backface-hidden w-full h-full">
                            <Card className="group h-full border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md overflow-hidden flex flex-col">
                              {/* Step level indicator */}
                              <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="hidden md:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        {getStepIcon(i, roadmap.length)}
                                      </div>
                                      <div>
                                        <h4 className="font-heading font-bold text-lg text-foreground leading-tight">{step.title}</h4>
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 px-1.5 mt-1 border-primary/20 bg-primary/5 text-primary">
                                          {getStepLevel(i, roadmap.length)}
                                        </Badge>
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className="text-xs gap-1 py-1 px-2.5">
                                      <Clock className="h-3 w-3" /> {step.year}
                                    </Badge>
                                  </div>
                                  
                                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                                    <p className="text-xs font-bold text-primary mb-3 uppercase tracking-widest flex items-center gap-2">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> High-Level Goals
                                    </p>
                                    <ul className="space-y-2.5">
                                      {step.milestones.slice(0, 3).map((m, j) => (
                                        <li key={j} className="text-sm flex items-start gap-2.5">
                                          <div className="mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0" />
                                          <span className="text-foreground/80 leading-snug">{m}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-border/50 flex justify-center">
                                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    Click to see details <ChevronRight className="h-3 w-3" />
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Back Side (Flipped) */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full">
                            <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-xl overflow-hidden flex flex-col">
                              <CardHeader className="py-4 border-b border-primary/10 bg-primary/5">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Target className="h-4 w-4 text-primary" />
                                    Detailed Roadmap: {step.year}
                                  </CardTitle>
                                  <Badge variant="outline" className="text-[10px] bg-background">FLIP BACK</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 overflow-y-auto max-h-[350px] space-y-4">
                                {/* Actions & Skills Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h5 className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3 text-success" /> Key Actions
                                    </h5>
                                    <ul className="text-xs space-y-1.5 pl-1">
                                      {step.actions.map((a, j) => (
                                        <li key={j} className="flex items-start gap-2 text-foreground/80 leading-normal">
                                          <span className="text-primary">•</span> {a}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="space-y-2">
                                    <h5 className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                      <BookOpen className="h-3 w-3 text-accent" /> Skills to Master
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                      {step.skills.map((s, j) => (
                                        <Badge key={j} variant="secondary" className="text-[10px] bg-background border-border/50">{s}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Schemes & Courses (Requested Features) */}
                                <div className="space-y-4 pt-2 border-t border-primary/10">
                                  {step.schemes && step.schemes.length > 0 && (
                                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                                      <h5 className="text-[11px] font-bold text-accent uppercase flex items-center gap-1.5 mb-2">
                                        <Award className="h-3.5 w-3.5" /> Govt. Schemes & Scholarships
                                      </h5>
                                      <ul className="text-xs space-y-1.5">
                                        {step.schemes.map((s, j) => (
                                          <li key={j} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                            {s}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {step.courses && step.courses.length > 0 && (
                                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                      <h5 className="text-[11px] font-bold text-primary uppercase flex items-center gap-1.5 mb-2">
                                        <GraduationCap className="h-3.5 w-3.5" /> Recommended Courses
                                      </h5>
                                      <ul className="text-xs space-y-1.5">
                                        {step.courses.map((c, j) => (
                                          <li key={j} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {c}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {/* Connector arrow for mobile */}
                        {i < roadmap.length - 1 && (
                          <div className="md:hidden flex justify-center py-2">
                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 rotate-90" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Destination Card */}
                  <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 border border-accent/20 text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <h3 className="font-heading font-bold text-lg text-foreground">{targetCareer}</h3>
                    <p className="text-sm text-muted-foreground">Your destination is {roadmap.length} milestones away</p>
                    <Badge className="mt-2 bg-accent/20 text-accent border-accent/30">Job Ready</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
