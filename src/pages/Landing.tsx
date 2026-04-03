import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { 
  Brain, GraduationCap, TrendingUp, Award, ArrowRight, Sparkles,
  Users, BookOpen, Target, ChevronRight, Briefcase, BarChart3,
  Rocket, Globe, Laptop, Trophy, Search, FileText, Mic, Keyboard,
  Shield, Zap, Route, UserCheck,
} from "lucide-react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import avsarLogo from "@/assets/avsar-logo.png";

const StatItem = ({ value, label, suffix = "" }: { value: number, label: string, suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(0, {
    mass: 1,
    stiffness: 100,
    damping: 30,
  });
  
  const displayValue = useTransform(spring, (current) => 
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return (
    <div ref={ref} className="group">
      <div className="flex items-baseline gap-0.5">
        <motion.p className="font-mono text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
          {displayValue}
        </motion.p>
        <span className="font-mono text-2xl font-bold text-primary">{suffix}</span>
      </div>
      <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-widest opacity-80">{label}</p>
    </div>
  );
};

interface FloatingIcon {
  Icon: typeof Brain;
  label: string;
  x: string;
  y: string;
  size: string;
  iconSize: string;
  delay: string;
  duration: string;
  blur?: string;
  scale?: string;
  color: 'primary' | 'accent';
}

const floatingIcons: FloatingIcon[] = [
  { Icon: GraduationCap, label: "Education", x: "5%", y: "6%", size: "p-3", iconSize: "w-5 h-5", delay: "0s", duration: "8s", color: "primary" },
  { Icon: Briefcase, label: "Career", x: "72%", y: "3%", size: "p-2.5", iconSize: "w-4 h-4", delay: "1.2s", duration: "10s", color: "accent" },
  { Icon: Rocket, label: "Growth", x: "88%", y: "30%", size: "p-3", iconSize: "w-5 h-5", delay: "0.6s", duration: "9s", color: "primary" },
  { Icon: Brain, label: "AI", x: "2%", y: "45%", size: "p-2.5", iconSize: "w-4 h-4", delay: "2s", duration: "11s", color: "accent", blur: "1px" },
  { Icon: BookOpen, label: "Learning", x: "70%", y: "68%", size: "p-2.5", iconSize: "w-4 h-4", delay: "0.8s", duration: "7s", color: "primary" },
  { Icon: BarChart3, label: "Analytics", x: "12%", y: "78%", size: "p-2", iconSize: "w-3.5 h-3.5", delay: "3s", duration: "10s", color: "accent", blur: "1.5px" },
  { Icon: Globe, label: "Global", x: "45%", y: "88%", size: "p-2.5", iconSize: "w-4 h-4", delay: "1.5s", duration: "8s", color: "primary" },
  { Icon: Laptop, label: "Tech", x: "38%", y: "2%", size: "p-2", iconSize: "w-3.5 h-3.5", delay: "2.5s", duration: "9s", color: "accent", blur: "1px" },
  { Icon: Trophy, label: "Achievement", x: "90%", y: "65%", size: "p-2", iconSize: "w-3.5 h-3.5", delay: "1.8s", duration: "11s", color: "primary", blur: "2px" },
  { Icon: Search, label: "Discovery", x: "22%", y: "30%", size: "p-2", iconSize: "w-3.5 h-3.5", delay: "3.5s", duration: "12s", color: "accent", blur: "1px" },
  { Icon: FileText, label: "Resume", x: "55%", y: "15%", size: "p-2.5", iconSize: "w-4 h-4", delay: "0.4s", duration: "9.5s", color: "primary" },
  { Icon: Target, label: "Goals", x: "82%", y: "85%", size: "p-2", iconSize: "w-3.5 h-3.5", delay: "2.8s", duration: "10.5s", color: "accent", blur: "1px" },
];

const AICareerOrbit = () => (
  <div className="relative w-full aspect-square max-w-[440px] mx-auto" aria-hidden="true">
    <div className="absolute inset-0 rounded-3xl">
      <div className="absolute inset-[15%] rounded-full bg-primary/6 blur-3xl" />
      <div className="absolute inset-[25%] rounded-full bg-accent/4 blur-2xl" />
    </div>
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <div className="relative">
        <div className="absolute -inset-10 rounded-full bg-primary/8 blur-2xl animate-pulse-glow" />
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-glow flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <img src={avsarLogo} alt="" className="w-14 h-14 md:w-16 md:h-16 object-contain relative z-10 rounded-xl" />
        </div>
      </div>
    </div>
    {floatingIcons.map(({ Icon, label, x, y, size, iconSize, delay, duration, blur, scale, color }) => (
      <div key={label} className="absolute z-10" style={{ left: x, top: y, filter: blur ? `blur(${blur})` : undefined, transform: scale ? `scale(${scale})` : undefined }}>
        <div className={`${size} rounded-xl bg-card/50 backdrop-blur-md border border-border/30 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-500 cursor-default motion-safe:animate-float`}
          style={{ animationDuration: duration, animationDelay: delay }}>
          <Icon className={`${iconSize} ${color === 'primary' ? 'text-primary' : 'text-accent'}`} strokeWidth={1.5} />
        </div>
      </div>
    ))}
  </div>
);

const AICareerOrbitMobile = () => (
  <div className="relative w-full aspect-square max-w-[260px] mx-auto" aria-hidden="true">
    <div className="absolute inset-[20%] rounded-full bg-primary/8 blur-2xl" />
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-primary/8 blur-xl animate-pulse-glow" />
        <div className="relative w-18 h-18 rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-glow flex items-center justify-center overflow-hidden p-3">
          <img src={avsarLogo} alt="" className="w-11 h-11 object-contain rounded-lg" />
        </div>
      </div>
    </div>
    {floatingIcons.slice(0, 5).map(({ Icon, label, delay, duration, color }, i) => {
      const mobilePositions = [
        { x: "5%", y: "10%" }, { x: "70%", y: "5%" }, { x: "78%", y: "60%" },
        { x: "5%", y: "68%" }, { x: "45%", y: "82%" },
      ];
      const pos = mobilePositions[i];
      return (
        <div key={label} className="absolute z-10" style={{ left: pos.x, top: pos.y }}>
          <div className="p-2 rounded-lg bg-card/50 backdrop-blur-md border border-border/30 shadow-sm motion-safe:animate-float"
            style={{ animationDuration: duration, animationDelay: delay }}>
            <Icon className={`w-3.5 h-3.5 ${color === 'primary' ? 'text-primary' : 'text-accent'}`} strokeWidth={1.5} />
          </div>
        </div>
      );
    })}
  </div>
);

const Landing = () => {
  const howItWorks = [
    { step: "01", title: "Create Profile", description: "Sign up and share your education, interests, and goals.", icon: UserCheck, color: "text-primary" },
    { step: "02", title: "Take Quiz", description: "AI-designed assessment of your logical, analytical, and creative skills.", icon: BookOpen, color: "text-accent" },
    { step: "03", title: "AI Analysis", description: "ML engine identifies your strengths and ideal career paths.", icon: Brain, color: "text-primary" },
    { step: "04", title: "Get Roadmap", description: "Personalized career paths, college matches, and scholarships.", icon: Route, color: "text-accent" },
  ];

  const whyDifferent = [
    { title: "AI Career Roadmap", description: "Step-by-step GPS navigation for your career journey", icon: Route, gradient: "from-primary/8 to-primary/3", iconColor: "text-primary" },
    { title: "Skill Gap Analyzer", description: "Identify missing skills with targeted improvement plans", icon: Target, gradient: "from-accent/8 to-accent/3", iconColor: "text-accent" },
    { title: "Career Twin", description: "Discover your career archetype and role-model matches", icon: Users, gradient: "from-primary/8 to-primary/3", iconColor: "text-primary" },
    { title: "Resume ATS Checker", description: "AI analysis with ATS compatibility scoring", icon: FileText, gradient: "from-accent/8 to-accent/3", iconColor: "text-accent" },
    { title: "Voice Confidence", description: "Speech analysis for interview readiness", icon: Mic, gradient: "from-primary/8 to-primary/3", iconColor: "text-primary" },
    { title: "Writing Assessment", description: "Speed and professional writing with AI feedback", icon: Keyboard, gradient: "from-accent/8 to-accent/3", iconColor: "text-accent" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="AVSAR - AI Career & Education Guidance | Find Your Perfect Path"
        description="AVSAR is India's leading AI-powered career guidance platform. Take aptitude tests, get personalized career recommendations, discover colleges, and find scholarships."
        keywords="career guidance, aptitude test, college finder, scholarship search, AI career recommendations, career counseling India"
        ogType="website"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[88vh] flex items-center bg-mesh-primary overflow-hidden pwa-hero-compact">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-20 right-[15%] w-64 h-64 bg-accent/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-[10%] w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-semibold mb-8 animate-fade-up tracking-wide uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Career Discovery
              </div>
              <h1 className="font-heading text-display-sm md:text-display leading-none mb-6 animate-fade-up stagger-1">
                <span className="text-foreground">Navigate</span><br />
                <span className="text-foreground">Your </span>
                <span className="gradient-text">Future</span>
                <span className="text-accent">.</span>
              </h1>
              <p className="text-body-lg text-muted-foreground max-w-xl mb-10 animate-fade-up stagger-2">
                Personalized career guidance powered by AI. Discover your path through aptitude assessment, 
                college matching, and scholarship discovery.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-14 animate-fade-up stagger-3">
                <Button size="lg" asChild className="text-sm px-7 h-11 bg-primary hover:bg-primary/90 shadow-glow rounded-xl font-semibold">
                  <Link to="/register">Start Your Journey <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-sm px-7 h-11 rounded-xl">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-8 md:gap-14 animate-fade-up stagger-4">
                <StatItem value={10000} label="Colleges" suffix="+" />
                <StatItem value={500} label="Scholarships" suffix="+" />
                <StatItem value={50} label="Career Paths" suffix="+" />
                <StatItem value={12} label="NGO Partners" suffix="+" />
              </div>
            </div>
            <div className="hidden md:block animate-fade-up stagger-2"><AICareerOrbit /></div>
          </div>
        </div>
        <div className="md:hidden container mx-auto px-4 relative z-10 mt-4 mb-8 pwa-hide-hero"><AICareerOrbitMobile /></div>
      </section>

      {/* How AVSAR Works */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">How It Works</p>
              <h2 className="font-heading text-title md:text-display-sm text-foreground">Four steps to your dream career</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {howItWorks.map((item, index) => (
                <div key={index} className="relative group">
                  <Card className="h-full border-border/50 card-hover-premium transition-all duration-300 overflow-hidden">
                    <CardContent className="p-5 text-center">
                      <div className="mx-auto w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Step {item.step}</span>
                      <h3 className="font-heading text-sm font-semibold text-foreground mt-1 mb-1.5">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                  {index < 3 && (
                    <div className="hidden md:flex absolute top-1/2 -right-2.5 transform -translate-y-1/2 z-10">
                      <ChevronRight className="h-4 w-4 text-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button size="lg" asChild className="h-11 px-7 rounded-xl font-semibold">
                <Link to="/register">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-mesh-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">What We Offer</p>
              <h2 className="font-heading text-title md:text-display-sm text-foreground max-w-xl">Your complete career guidance toolkit</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 lg:row-span-2 group overflow-hidden border-border/50 hover:border-primary/25 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-primary/3 to-transparent">
                <CardContent className="p-8 md:p-10 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-subtitle text-foreground mb-3">AI-Powered Aptitude Assessment</h3>
                  <p className="text-sm text-muted-foreground mb-5 flex-grow leading-relaxed">
                    Our comprehensive quiz understands your strengths, interests, and learning style. 
                    AI analyzes responses to generate personalized career recommendations with confidence scores.
                  </p>
                  <Link to="/quiz" className="inline-flex items-center text-primary text-sm font-semibold hover:underline">
                    Take the Quiz <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              {[
                { icon: GraduationCap, title: "College Finder", desc: "Search 10,000+ Indian colleges by state, course, and fees.", color: "accent" },
                { icon: Award, title: "Scholarship Match", desc: "Discover scholarships matched to your eligibility.", color: "primary" },
                { icon: TrendingUp, title: "Career Explorer", desc: "Explore 50+ career paths with growth data.", color: "accent" },
                { icon: Users, title: "NGO Network", desc: "Connect with educational NGOs for mentorship.", color: "primary" },
              ].map((item, i) => (
                <Card key={i} className="group border-border/50 hover:border-primary/25 transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl bg-${item.color}/8 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`h-5 w-5 text-${item.color}`} />
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why AVSAR Is Different */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-3">Why Choose AVSAR</p>
              <h2 className="font-heading text-title md:text-display-sm text-foreground">6 AI tools that set us apart</h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">Cutting-edge AI tools for complete career readiness.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {whyDifferent.map((item, i) => (
                <Card key={i} className="group border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md overflow-hidden">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights */}
      <section className="py-20 md:py-28 bg-mesh-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">AI-Powered Insights</p>
              <h2 className="font-heading text-title md:text-display-sm text-foreground">Smart data for smarter decisions</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: TrendingUp, title: "Career Demand Trends", desc: "AI tracks industry hiring patterns.", badges: ["Tech +24%", "Healthcare +18%"], color: "primary" },
                { icon: Zap, title: "Skill Market Insights", desc: "Most in-demand skills right now.", badges: ["Python", "Data Science"], color: "accent" },
                { icon: Shield, title: "Automation Risk", desc: "Plan your future with confidence.", badges: ["Low Risk", "High Risk"], color: "primary" },
              ].map((item, i) => (
                <Card key={i} className="group border-border/50 hover:border-primary/20 transition-all text-center hover:shadow-md">
                  <CardContent className="p-6">
                    <div className={`mx-auto w-12 h-12 rounded-xl bg-${item.color}/8 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`h-6 w-6 text-${item.color}`} />
                    </div>
                    <h3 className="font-heading text-sm font-semibold mb-1.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{item.desc}</p>
                    <div className="flex justify-center gap-1.5">
                      {item.badges.map(b => <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/4 via-background to-accent/4">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-title md:text-display-sm text-foreground mb-5">Ready to discover your path?</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of students who have found clarity in their career journey with AVSAR.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="h-11 px-7 shadow-glow rounded-xl font-semibold">
                <Link to="/register">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-11 px-7 rounded-xl">
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
