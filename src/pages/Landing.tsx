import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { 
  Brain, 
  GraduationCap, 
  TrendingUp, 
  Award,
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  BookOpen,
  Target,
  ChevronRight
} from "lucide-react";
import avsarLogo from "@/assets/avsar-logo.png";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="AVSAR - AI Career & Education Guidance | Find Your Perfect Path"
        description="AVSAR is India's leading AI-powered career guidance platform. Take aptitude tests, get personalized career recommendations, discover colleges, and find scholarships - all for free."
        keywords="career guidance, aptitude test, college finder, scholarship search, AI career recommendations, career counseling India, education guidance, IIT JEE, NEET preparation, career options after 12th"
        ogType="website"
      />
      <Navigation />
      
      {/* Hero Section - Editorial & Distinctive */}
      <section className="relative min-h-[90vh] flex items-center bg-mesh-primary overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        
        {/* Floating accent shapes */}
        <div className="absolute top-20 right-[15%] w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-up">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Career Discovery</span>
            </div>

            {/* Hero Headline - Oversized, Editorial */}
            <h1 className="font-heading text-display-sm md:text-display leading-none mb-6 animate-fade-up stagger-1">
              <span className="text-foreground">Navigate Your</span>
              <br />
              <span className="text-primary">Future</span>
              <span className="text-accent">.</span>
            </h1>

            <p className="text-body-lg text-muted-foreground max-w-2xl mb-10 animate-fade-up stagger-2">
              Personalized career guidance powered by AI. Discover the right path through aptitude assessment, 
              college recommendations, and scholarship matching—designed for Indian students.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-up stagger-3">
              <Button size="lg" asChild className="text-base px-8 h-12 bg-primary hover:bg-primary/90 shadow-glow">
                <Link to="/register">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 h-12">
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-12 animate-fade-up stagger-4">
              <div>
                <p className="font-mono text-3xl font-semibold text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground">Colleges Listed</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-semibold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Scholarships</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-semibold text-foreground">50+</p>
                <p className="text-sm text-muted-foreground">Career Paths</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-semibold text-foreground">12+</p>
                <p className="text-sm text-muted-foreground">NGO Partners</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Asymmetric Layout */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header - Left aligned, editorial */}
            <div className="mb-16">
              <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">
                What We Offer
              </p>
              <h2 className="font-heading text-title md:text-display-sm text-foreground max-w-xl">
                Your complete career guidance toolkit
              </h2>
            </div>

            {/* Feature Grid - Asymmetric */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Large Feature Card */}
              <Card className="lg:col-span-2 lg:row-span-2 group overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-8 md:p-12 h-full flex flex-col">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Brain className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-heading text-subtitle text-foreground mb-4">
                    AI-Powered Aptitude Assessment
                  </h3>
                  <p className="text-muted-foreground mb-6 flex-grow">
                    Take our comprehensive quiz designed to understand your strengths, interests, and learning style. 
                    Our AI analyzes your responses to generate personalized career recommendations with confidence scores.
                  </p>
                  <Link 
                    to="/quiz" 
                    className="inline-flex items-center text-primary font-medium hover:underline"
                  >
                    Take the Quiz
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              {/* Smaller Cards */}
              <Card className="group border-2 border-transparent hover:border-accent/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    College Finder
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Search 10,000+ Indian colleges by state, district, course, and fees. Find your perfect fit.
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-2 border-transparent hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    Scholarship Match
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Discover scholarships matched to your eligibility with deadline tracking and application links.
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-2 border-transparent hover:border-success/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    Career Explorer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Explore 50+ career paths with detailed information on requirements, growth, and salary ranges.
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-2 border-transparent hover:border-accent/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    NGO Support Network
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with educational NGOs working across India for mentorship and resources.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Clean, numbered steps */}
      <section className="py-24 md:py-32 bg-mesh-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">
                Getting Started
              </p>
              <h2 className="font-heading text-title md:text-display-sm text-foreground">
                Three steps to clarity
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  step: "01",
                  title: "Complete Your Profile",
                  description: "Tell us about your education, interests, and goals. This helps our AI understand you better.",
                  icon: Target
                },
                {
                  step: "02", 
                  title: "Take the Aptitude Quiz",
                  description: "Answer questions that assess your logical, analytical, creative, and technical abilities.",
                  icon: BookOpen
                },
                {
                  step: "03",
                  title: "Get Your Roadmap",
                  description: "Receive personalized career recommendations, college matches, and scholarship opportunities.",
                  icon: MapPin
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  {/* Connector line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-[2px] bg-border" />
                  )}
                  
                  <div className="relative">
                    <span className="font-mono text-6xl font-bold text-muted/30 select-none">
                      {item.step}
                    </span>
                    <div className="absolute top-6 left-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mt-6 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Button size="lg" asChild className="h-12 px-8">
                <Link to="/register">
                  Start Now — It's Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - Minimal */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-8">
              Trusted by students across India
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
              {/* Placeholder for trust badges or partner logos */}
              <span className="font-heading text-lg text-muted-foreground">Government Scholarships</span>
              <span className="font-heading text-lg text-muted-foreground">Private Universities</span>
              <span className="font-heading text-lg text-muted-foreground">NGO Partners</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Bold, Simple */}
      <section className="py-24 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-title md:text-display-sm mb-6">
              Your future starts with the right guidance
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-10">
              Join thousands of students who found clarity in their career journey with AVSAR.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              asChild 
              className="h-12 px-8 text-base shadow-lg"
            >
              <Link to="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;