import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  Brain, 
  GraduationCap, 
  Search, 
  TrendingUp, 
  Award,
  CheckCircle,
  Users,
  Star
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="font-heading font-bold text-4xl md:text-6xl leading-tight">
              Discover Your Perfect
              <span className="text-primary"> Career Path </span>
              with AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get personalized career recommendations, find the right colleges, and discover scholarship opportunities—all powered by artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg">
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-accent" size={20} />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-accent" size={20} />
                <span>Free aptitude quiz</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-5xl mb-4">
              Why Choose Avsar?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make informed decisions about your future
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="text-primary" size={32} />
                </div>
                <h3 className="font-heading font-semibold text-xl">AI-Powered Quiz</h3>
                <p className="text-muted-foreground">
                  Take our comprehensive aptitude assessment and receive personalized career recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="text-accent" size={32} />
                </div>
                <h3 className="font-heading font-semibold text-xl">Career Guidance</h3>
                <p className="text-muted-foreground">
                  Explore detailed career paths with requirements, growth potential, and salary insights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <GraduationCap className="text-primary" size={32} />
                </div>
                <h3 className="font-heading font-semibold text-xl">College Finder</h3>
                <p className="text-muted-foreground">
                  Discover colleges that match your career goals with detailed information and comparisons.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Award className="text-accent" size={32} />
                </div>
                <h3 className="font-heading font-semibold text-xl">Scholarships</h3>
                <p className="text-muted-foreground">
                  Access thousands of scholarship opportunities with eligibility tracking and deadlines.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-5xl mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Your journey to the perfect career in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                1
              </div>
              <h3 className="font-heading font-semibold text-xl">Take the Quiz</h3>
              <p className="text-muted-foreground">
                Complete our comprehensive aptitude assessment to understand your strengths and interests.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                2
              </div>
              <h3 className="font-heading font-semibold text-xl">Get Recommendations</h3>
              <p className="text-muted-foreground">
                Receive AI-powered career suggestions tailored to your unique profile and goals.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                3
              </div>
              <h3 className="font-heading font-semibold text-xl">Explore & Apply</h3>
              <p className="text-muted-foreground">
                Discover colleges and scholarships that align with your chosen career path.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/register">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-5xl mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              Hear from students who found their path with Avsar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-accent fill-accent" size={20} />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "Avsar helped me discover my passion for data science. The career recommendations were spot-on, and I found the perfect college program!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Computer Science Student</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-accent fill-accent" size={20} />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "The scholarship finder saved me thousands of dollars. I never knew there were so many opportunities available for students like me."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Users className="text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Engineering Major</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-accent fill-accent" size={20} />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "As a career changer, I was lost. Avsar's AI-powered guidance gave me clarity and confidence in choosing my new path."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Emily Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Healthcare Professional</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-primary-foreground">
              Ready to Discover Your Future?
            </h2>
            <p className="text-lg text-primary-foreground/90">
              Join thousands of students making informed career decisions with AI-powered guidance
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg">
              <Link to="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
