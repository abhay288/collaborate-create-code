import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AvsarLogo from "@/components/AvsarLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, BookOpen, GraduationCap, Award, User, BarChart3, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

const HelpCenter = () => {
  const faqCategories = [
    {
      icon: HelpCircle,
      title: "About Avsar",
      faqs: [
        {
          question: "What is Avsar?",
          answer: "Avsar is an AI-powered career and education guidance platform designed to help students make informed decisions about their future. It uses advanced machine learning algorithms to analyze your aptitude, interests, and goals to provide personalized career recommendations, college suggestions, and scholarship opportunities."
        },
        {
          question: "Is Avsar free to use?",
          answer: "Yes, Avsar is completely free for students. You can take aptitude quizzes, receive career recommendations, explore colleges, and discover scholarships without any cost. We believe quality career guidance should be accessible to everyone."
        },
        {
          question: "How does Avsar's AI work?",
          answer: "Avsar uses a combination of aptitude assessment scores, user preferences, location data, and machine learning models to generate personalized recommendations. Our AI analyzes your quiz responses across categories like logical reasoning, creativity, analytical skills, and technical interests to build a unique profile and match you with suitable career paths and educational opportunities."
        },
        {
          question: "Who can use Avsar?",
          answer: "Avsar is designed for students at various stages of their educational journey – from high school students exploring career options to college students looking for the right programs. The platform adapts its recommendations based on your current class level and study area."
        }
      ]
    },
    {
      icon: BookOpen,
      title: "Aptitude Quiz",
      faqs: [
        {
          question: "How long does the aptitude quiz take?",
          answer: "The aptitude quiz typically takes 15-25 minutes to complete, depending on how quickly you answer. The quiz consists of 15-20 questions across different categories including logical reasoning, analytical skills, creativity, and technical interests."
        },
        {
          question: "Can I retake the aptitude quiz?",
          answer: "Yes, you can retake the aptitude quiz anytime. Your latest quiz results will be used for generating new recommendations. We recommend retaking the quiz if your interests or goals have changed significantly."
        },
        {
          question: "What categories does the quiz assess?",
          answer: "The quiz assesses multiple dimensions including: Logical Reasoning, Analytical Skills, Creativity, Technical Interests, Quantitative Aptitude, Verbal Ability, and Interpersonal Skills. Each category contributes to your overall profile for more accurate recommendations."
        },
        {
          question: "Are quiz questions different each time?",
          answer: "Yes, questions are dynamically selected based on your class level and study area. The AI also generates new questions to ensure fresh assessments. This helps provide more accurate and updated evaluations of your aptitude."
        }
      ]
    },
    {
      icon: GraduationCap,
      title: "College Recommendations",
      faqs: [
        {
          question: "How are colleges recommended to me?",
          answer: "Colleges are recommended based on multiple factors: your quiz-derived career interests, preferred courses, location preferences (state and district), college ratings, and the courses they offer. We prioritize colleges in your state first, then nearby states, ensuring locally relevant suggestions."
        },
        {
          question: "Can I filter colleges by location?",
          answer: "Yes, you can set your preferred state and district in your profile. The recommendation engine will prioritize colleges in your preferred location. You can also browse the full college database and apply filters for location, courses, fees, and ratings."
        },
        {
          question: "What information is available for each college?",
          answer: "For each college, you can view: name, location (state and district), courses offered, fees, ratings, NAAC grade, affiliation, established year, admission links, and contact information. We strive to keep this information updated and accurate."
        },
        {
          question: "Why am I seeing colleges from other states?",
          answer: "If there aren't enough colleges in your state offering your recommended courses, the system includes colleges from nearby states. This ensures you have multiple options to consider. All-India colleges are shown only when regional options are very limited."
        }
      ]
    },
    {
      icon: Award,
      title: "Scholarships",
      faqs: [
        {
          question: "How do I find scholarships on Avsar?",
          answer: "Visit the Scholarships section to browse all available scholarships. You can filter by type (government, private, NGO), eligibility criteria, deadlines, and amounts. Verified scholarships include direct application links and tutorial videos to help you apply."
        },
        {
          question: "What are 'Verified Scholarships'?",
          answer: "Verified Scholarships are opportunities that our team has manually verified for authenticity. These include confirmed application links, official domains, eligibility criteria, and often YouTube tutorial videos explaining the application process."
        },
        {
          question: "How often is scholarship information updated?",
          answer: "We regularly update scholarship information including deadlines, eligibility criteria, and amounts. Verified scholarships show the 'last checked' date so you know how recent the information is. However, always verify details on the official scholarship website before applying."
        },
        {
          question: "Can Avsar help me apply for scholarships?",
          answer: "Avsar provides all the information you need to apply, including eligibility criteria, required documents, and application links. For verified scholarships, we also include tutorial videos. However, the actual application must be submitted through the official scholarship portal."
        }
      ]
    },
    {
      icon: User,
      title: "Profile & Account",
      faqs: [
        {
          question: "How do I update my profile?",
          answer: "Go to the Profile page from the dashboard or navigation menu. Here you can update your personal information, education level, class, study area, interests, and location preferences. Updating your profile helps improve the accuracy of recommendations."
        },
        {
          question: "Can I change my preferred location for recommendations?",
          answer: "Yes, you can update your preferred state and district in your profile settings. After updating, your college and scholarship recommendations will reflect your new location preferences."
        },
        {
          question: "How do I delete my account?",
          answer: "To delete your account, go to Profile settings and look for the account deletion option. Please note that account deletion is permanent and will remove all your quiz history, saved items, and recommendations."
        },
        {
          question: "Is my personal data secure?",
          answer: "Yes, we take data security seriously. Your data is encrypted and stored securely using Supabase's enterprise-grade security. We never share your personal information with third parties without your explicit consent. Read our Privacy Policy for more details."
        }
      ]
    },
    {
      icon: BarChart3,
      title: "Recommendations & Results",
      faqs: [
        {
          question: "How accurate are the career recommendations?",
          answer: "Our recommendations are based on validated aptitude assessment methodologies and AI analysis. Each recommendation comes with a confidence score indicating how well it matches your profile. While we strive for accuracy, recommendations should be used as guidance alongside personal research and professional counseling."
        },
        {
          question: "Why don't I see any recommendations?",
          answer: "Recommendations are generated after you complete the aptitude quiz. If you haven't taken the quiz yet, please do so first. If you've taken the quiz but still don't see recommendations, try refreshing the page or checking if the onboarding is complete in your profile."
        },
        {
          question: "Can I provide feedback on recommendations?",
          answer: "Yes! Each recommendation has feedback buttons (thumbs up/down) that help us improve our AI. Your feedback is valuable and helps us provide better suggestions to all users."
        },
        {
          question: "How do I save colleges or scholarships for later?",
          answer: "You can save any college or scholarship to your favorites by clicking the heart/bookmark icon on the card. Access your saved items from the dashboard or profile page."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
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
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
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
