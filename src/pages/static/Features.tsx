import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AvsarLogo from "@/components/AvsarLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  GraduationCap, 
  MapPin, 
  Award, 
  BarChart3, 
  Shield, 
  Zap, 
  Users,
  Target,
  BookOpen,
  Building2,
  Sparkles
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Aptitude Quiz",
      description: "Take our comprehensive aptitude assessment that evaluates your logical reasoning, analytical skills, creativity, and technical interests to build your unique profile.",
      highlight: true
    },
    {
      icon: Target,
      title: "Personalized Career Recommendations",
      description: "Get AI-generated career suggestions tailored to your aptitude scores, interests, and goals with confidence ratings for each recommendation."
    },
    {
      icon: GraduationCap,
      title: "Smart College Finder",
      description: "Discover colleges that match your career goals, preferred location, and eligibility. Filter by state, district, courses offered, fees, and ratings."
    },
    {
      icon: MapPin,
      title: "Location-Based Suggestions",
      description: "Receive college recommendations prioritized by your state and district, with nearby state options when local results are limited."
    },
    {
      icon: Award,
      title: "Verified Scholarships",
      description: "Access curated scholarship opportunities with verified application links, eligibility criteria, deadlines, and step-by-step tutorial videos."
    },
    {
      icon: Building2,
      title: "Verified Job Listings",
      description: "Explore entry-level job opportunities from trusted sources, matched to your skills and career interests."
    },
    {
      icon: BarChart3,
      title: "Progress Dashboard",
      description: "Track your quiz performance, view category-wise scores, and monitor your career exploration journey with visual analytics."
    },
    {
      icon: BookOpen,
      title: "Course Recommendations",
      description: "Get suggestions for courses and educational paths that align with your recommended careers and current academic level."
    },
    {
      icon: Shield,
      title: "Data Privacy & Security",
      description: "Your personal information is encrypted and protected. We never share your data without explicit consent."
    },
    {
      icon: Zap,
      title: "Real-Time Updates",
      description: "Receive instant notifications about new scholarship deadlines, job opportunities, and platform updates."
    },
    {
      icon: Users,
      title: "Multi-User Support",
      description: "Separate profiles for students and administrators with role-based access to features and data management."
    },
    {
      icon: Sparkles,
      title: "Continuous AI Learning",
      description: "Our recommendation engine improves over time based on user feedback and outcomes to provide better suggestions."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <AvsarLogo size="lg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Powerful Features for Your <span className="text-primary">Career Journey</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover how Avsar's AI-powered platform helps you make informed decisions about 
              your education and career path.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`hover:shadow-lg transition-shadow ${
                  feature.highlight ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${
                    feature.highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                  }`}>
                    <feature.icon className={`h-6 w-6 ${feature.highlight ? '' : 'text-primary'}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">Ready to Discover Your Path?</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join thousands of students who are using Avsar to make informed career decisions. 
              Take the aptitude quiz and get personalized recommendations today.
            </p>
            <a 
              href="/register" 
              className="inline-flex items-center justify-center px-8 py-3 bg-background text-foreground rounded-lg font-semibold hover:bg-secondary transition-colors"
            >
              Get Started Free
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
