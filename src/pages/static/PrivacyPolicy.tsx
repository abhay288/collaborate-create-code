import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AvsarLogo from "@/components/AvsarLogo";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_ADDRESS } from "@/lib/constants";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="Privacy Policy - AVSAR | Data Protection & Security"
        description="Read AVSAR's privacy policy to understand how we collect, use, and protect your personal information. We are committed to student data privacy and security."
        keywords="avsar privacy policy, data protection, student data security, career guidance privacy, education platform privacy"
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
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Privacy <span className="text-primary">Policy</span>
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
              <h2>Introduction</h2>
              <p>
                Welcome to Avsar ("we," "our," or "us"). We are committed to protecting your privacy 
                and ensuring the security of your personal information. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our 
                AI-powered career and education guidance platform.
              </p>

              <h2>Information We Collect</h2>
              
              <h3>Personal Information</h3>
              <p>When you register and use Avsar, we collect:</p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, and password (encrypted)</li>
                <li><strong>Profile Information:</strong> Age, education level, class/grade, study area, interests, and career goals</li>
                <li><strong>Location Preferences:</strong> Preferred state and district for college recommendations</li>
                <li><strong>Profile Picture:</strong> Optional profile photo you choose to upload</li>
              </ul>

              <h3>Usage Information</h3>
              <p>We automatically collect information about your interaction with Avsar:</p>
              <ul>
                <li>Quiz responses and aptitude assessment results</li>
                <li>Pages visited and features used</li>
                <li>Recommendations viewed and feedback provided</li>
                <li>Saved colleges, scholarships, and careers</li>
                <li>Device information and browser type</li>
              </ul>

              <h2>How We Use Your Information</h2>
              
              <h3>AI-Powered Recommendations</h3>
              <p>
                Your information is processed by our AI systems to provide personalized career 
                recommendations, college suggestions, and scholarship matches. Our machine learning 
                models analyze your aptitude scores, interests, location, and goals to generate 
                relevant suggestions. This processing is essential to deliver the core functionality 
                of Avsar.
              </p>

              <h3>Service Improvement</h3>
              <p>
                Aggregated and anonymized data helps us improve our recommendation algorithms, 
                enhance user experience, and develop new features. Individual user data is never 
                sold or used for advertising purposes.
              </p>

              <h3>Communication</h3>
              <p>
                We may send you important updates about your account, new features, scholarship 
                deadlines, or changes to our services. You can opt out of non-essential 
                communications at any time.
              </p>

              <h2>Data Storage and Security</h2>
              
              <h3>Supabase Infrastructure</h3>
              <p>
                Your data is stored securely using Supabase, a trusted backend-as-a-service 
                platform. Supabase provides enterprise-grade security including:
              </p>
              <ul>
                <li>Data encryption at rest and in transit</li>
                <li>Row-Level Security (RLS) policies ensuring you can only access your own data</li>
                <li>Regular security audits and compliance certifications</li>
                <li>Automatic backups and disaster recovery</li>
              </ul>

              <h3>Authentication Security</h3>
              <p>
                We use Supabase Authentication which provides secure password hashing, 
                session management, and optional social login through trusted providers. 
                We never store your passwords in plain text.
              </p>

              <h2>Third-Party Integrations</h2>
              
              <h3>AI Services</h3>
              <p>
                We use AI models to generate personalized career descriptions and 
                recommendations. When processing your data through AI services, we only share 
                the minimum necessary information (aptitude scores, interests) without 
                personally identifiable details.
              </p>

              <h3>Location Services</h3>
              <p>
                For location-based college recommendations, we may use geographic data. 
                This is used solely to improve the relevance of recommendations and is not 
                shared with third parties for marketing purposes.
              </p>

              <h3>Analytics</h3>
              <p>
                We use privacy-respecting analytics to understand how users interact with 
                Avsar. This helps us improve the platform without compromising your privacy.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li><strong>Access:</strong> View all personal data we have about you</li>
                <li><strong>Update:</strong> Correct or update your profile information at any time</li>
                <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                <li><strong>Export:</strong> Download your quiz results and recommendations</li>
                <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
              </ul>

              <h2>Data Retention</h2>
              <p>
                We retain your personal data for as long as your account is active. If you 
                delete your account, we will remove your personal data within 30 days, except 
                where we are required to retain it for legal or compliance purposes.
              </p>

              <h2>Children's Privacy</h2>
              <p>
                Avsar is designed for students, including those under 18. We collect only the 
                information necessary to provide career guidance services. Parents or guardians 
                may contact us to review, update, or delete their child's information.
              </p>

              <h2>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                significant changes by email or through a prominent notice on our platform. 
                Continued use of Avsar after changes constitutes acceptance of the updated policy.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data practices, please 
                contact us at:
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

export default PrivacyPolicy;
