import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AvsarLogo from "@/components/AvsarLogo";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Brain, Award, Lightbulb, GraduationCap } from "lucide-react";

const About = () => {
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
              About <span className="text-primary">Avsar</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering students to make informed career and educational decisions through 
              AI-powered personalized guidance and recommendations.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-semibold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To democratize access to quality career guidance by leveraging artificial intelligence, 
                  helping every student discover their true potential and find the right educational path 
                  regardless of their background or location.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-accent/20">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-accent" />
                </div>
                <h2 className="text-2xl font-heading font-semibold mb-4">Our Vision</h2>
                <p className="text-muted-foreground">
                  To become India's most trusted AI-powered career guidance platform, transforming how 
                  students navigate educational choices and empowering them to build successful, 
                  fulfilling careers.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">What We Do</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Assessment</h3>
                <p className="text-muted-foreground">
                  Our intelligent aptitude quiz analyzes your skills, interests, and personality to 
                  understand your unique profile.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personalized Recommendations</h3>
                <p className="text-muted-foreground">
                  Get tailored career paths, college suggestions, and scholarship opportunities 
                  matched to your profile and location.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Opportunities</h3>
                <p className="text-muted-foreground">
                  Access verified scholarships, verified job listings, and authentic college 
                  information to make confident decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { title: "Student-First", desc: "Every feature is designed with students' needs in mind" },
              { title: "Data Privacy", desc: "Your information is protected and never shared without consent" },
              { title: "Accessibility", desc: "Quality guidance available to students from all backgrounds" },
              { title: "Continuous Learning", desc: "Our AI improves with every interaction to serve you better" },
            ].map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-4">Built by Students, For Students</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Avsar was created by a team passionate about education and technology. We understand 
              the challenges students face when making career decisions because we've been there. 
              Our platform combines cutting-edge AI with deep understanding of the Indian education system.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
