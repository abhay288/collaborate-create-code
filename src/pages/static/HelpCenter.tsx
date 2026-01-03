import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AvsarLogo from "@/components/AvsarLogo";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, BookOpen, GraduationCap, Award, User, BarChart3, Link as LinkIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useFAQs } from "@/hooks/useFAQs";

const CATEGORY_ICONS: Record<string, any> = {
  "About Avsar": HelpCircle,
  "Aptitude Quiz": BookOpen,
  "College Recommendations": GraduationCap,
  "Scholarships": Award,
  "Profile & Account": User,
  "Recommendations & Results": BarChart3,
};

const HelpCenter = () => {
  const { groupedFaqs, loading, error } = useFAQs();
  const categories = Object.keys(groupedFaqs);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="Help Center - AVSAR | FAQs & Support"
        description="Find answers to frequently asked questions about AVSAR's AI-powered career guidance, aptitude quiz, college recommendations, and scholarship discovery features."
        keywords="avsar help, faq career guidance, aptitude quiz help, college recommendation faq, scholarship questions, student support"
      />
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <AvsarLogo size="lg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Help <span className="text-primary">Center</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to frequently asked questions about Avsar's features, 
              recommendations, and how to make the most of your career guidance journey.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Failed to load FAQs. Please try again later.</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No FAQs available at the moment.</p>
              </div>
            ) : (
              categories.map((category, categoryIndex) => {
                const IconComponent = CATEGORY_ICONS[category] || HelpCircle;
                return (
                  <Card key={categoryIndex}>
                    <div className="p-6 pb-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-heading font-semibold">{category}</h2>
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <Accordion type="single" collapsible className="w-full">
                        {groupedFaqs[category].map((faq, faqIndex) => (
                          <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Still Need Help */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-heading font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <LinkIcon className="h-4 w-4" />
              Contact Support
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
