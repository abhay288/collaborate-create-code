import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AvsarLogo from "@/components/AvsarLogo";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_ADDRESS } from "@/lib/constants";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="Terms of Service - AVSAR | Usage Agreement"
        description="Read AVSAR's terms of service to understand the acceptable use policy, recommendation disclaimers, and user responsibilities when using our career guidance platform."
        keywords="avsar terms of service, usage agreement, career guidance terms, education platform terms, user agreement"
      />
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <AvsarLogo size="lg" />
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Terms of <span className="text-primary">Service</span>
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 2, 2026
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
              <h2>Agreement to Terms</h2>
              <p>
                By accessing and using Avsar ("the Platform"), you agree to be bound by these 
                Terms of Service ("Terms"). If you do not agree to these Terms, please do not 
                use the Platform. These Terms constitute a legally binding agreement between 
                you and Avsar.
              </p>

              <h2>Description of Service</h2>
              <p>
                Avsar is an AI-powered career and education guidance platform that provides:
              </p>
              <ul>
                <li>Aptitude assessment through interactive quizzes</li>
                <li>AI-generated career recommendations</li>
                <li>College and course suggestions based on user profiles</li>
                <li>Scholarship discovery and information</li>
                <li>Verified job listings and opportunities</li>
              </ul>

              <h2>User Accounts</h2>
              
              <h3>Registration</h3>
              <p>
                To access certain features, you must create an account. You agree to provide 
                accurate, current, and complete information during registration and to update 
                this information to keep it accurate.
              </p>

              <h3>Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account 
                credentials and for all activities that occur under your account. You agree 
                to notify us immediately of any unauthorized use of your account.
              </p>

              <h3>Account Responsibility</h3>
              <p>
                You are solely responsible for your account and any actions taken through it. 
                Do not share your login credentials with others or allow others to access 
                your account.
              </p>

              <h2>Acceptable Use</h2>
              <p>When using Avsar, you agree NOT to:</p>
              <ul>
                <li>Provide false or misleading information in your profile or assessments</li>
                <li>Use the Platform for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Platform</li>
                <li>Interfere with or disrupt the Platform's functionality</li>
                <li>Use automated systems (bots, scrapers) to access the Platform</li>
                <li>Harvest or collect user information without consent</li>
                <li>Impersonate another person or entity</li>
                <li>Use the Platform to spam, harass, or harm others</li>
                <li>Attempt to reverse-engineer our AI algorithms</li>
              </ul>

              <h2>Recommendation Disclaimer</h2>
              
              <h3>Nature of Recommendations</h3>
              <p>
                <strong>Important:</strong> Career recommendations, college suggestions, and 
                scholarship matches provided by Avsar are generated by AI algorithms based on 
                your profile and assessment data. These are intended as guidance tools, not 
                definitive advice.
              </p>

              <h3>No Guarantee of Outcomes</h3>
              <p>
                We do not guarantee:
              </p>
              <ul>
                <li>Admission to any recommended college</li>
                <li>Award of any scholarship</li>
                <li>Employment in any recommended career</li>
                <li>Accuracy of all information about colleges, scholarships, or careers</li>
                <li>Success in any educational or career pursuit</li>
              </ul>

              <h3>User Responsibility</h3>
              <p>
                You are responsible for conducting your own research, verifying information, 
                and making independent decisions. We recommend consulting with educational 
                counselors, career advisors, and other professionals before making important 
                life decisions.
              </p>

              <h2>College and Scholarship Information</h2>
              <p>
                Information about colleges, scholarships, and jobs displayed on Avsar is 
                collected from various sources and may change without notice. While we strive 
                to keep information current and accurate:
              </p>
              <ul>
                <li>Always verify details on official institution websites</li>
                <li>Check application deadlines directly with providers</li>
                <li>Confirm eligibility criteria before applying</li>
                <li>We are not responsible for changes made by third parties</li>
              </ul>

              <h2>Intellectual Property</h2>
              
              <h3>Platform Content</h3>
              <p>
                All content, features, and functionality of Avsar, including but not limited 
                to text, graphics, logos, icons, images, audio clips, and software, are owned 
                by Avsar and protected by intellectual property laws.
              </p>

              <h3>User Content</h3>
              <p>
                You retain ownership of content you submit (profile information, feedback). 
                By submitting content, you grant Avsar a non-exclusive, royalty-free license 
                to use, process, and display this content to provide our services.
              </p>

              <h3>AI-Generated Content</h3>
              <p>
                Recommendations, descriptions, and other AI-generated content provided to 
                you are for your personal use only. You may not reproduce, distribute, or 
                commercially exploit this content without our permission.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Avsar shall not be liable for:
              </p>
              <ul>
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or opportunities</li>
                <li>Decisions made based on Platform recommendations</li>
                <li>Actions of third parties (colleges, scholarship providers, employers)</li>
                <li>Technical issues, downtime, or service interruptions</li>
              </ul>
              <p>
                Our total liability for any claims shall not exceed the amount you paid us 
                in the twelve months preceding the claim (which is zero for free accounts).
              </p>

              <h2>Account Termination</h2>
              
              <h3>By You</h3>
              <p>
                You may delete your account at any time through your profile settings. Upon 
                deletion, your personal data will be removed according to our Privacy Policy.
              </p>

              <h3>By Us</h3>
              <p>
                We reserve the right to suspend or terminate your account if you:
              </p>
              <ul>
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent or harmful activities</li>
                <li>Misuse the Platform or its features</li>
                <li>Provide false information</li>
              </ul>

              <h2>Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will notify you of significant 
                changes via email or Platform notification. Your continued use after changes 
                constitutes acceptance of the modified Terms.
              </p>

              <h2>Governing Law</h2>
              <p>
                These Terms are governed by the laws of India. Any disputes arising from 
                these Terms or your use of Avsar shall be resolved in the courts of India.
              </p>

              <h2>Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining 
                provisions will continue in full force and effect.
              </p>

              <h2>Contact Information</h2>
              <p>
                For questions about these Terms, please contact us at:
              </p>
              <ul>
                <li>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
                <li>Address: {CONTACT_ADDRESS}</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
