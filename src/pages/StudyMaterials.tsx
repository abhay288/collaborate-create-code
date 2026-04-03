import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import {
  BookOpen, ExternalLink, Search, GraduationCap, Code, Brain,
  FileText, School, Laptop, Youtube, Globe, Shield,
} from "lucide-react";

type Category = "all" | "government_exams" | "technical" | "aptitude" | "resume_interview" | "school" | "coding" | "youtube";

interface StudyResource {
  name: string;
  url: string;
  description: string;
  category: Category;
  source: "government" | "global" | "competitive" | "youtube";
  tags: string[];
}

const RESOURCES: StudyResource[] = [
  // 🇮🇳 Government / Official
  { name: "SWAYAM", url: "https://swayam.gov.in/", description: "Free government courses on engineering, management, sciences and more. Earn certificates from top Indian universities.", category: "government_exams", source: "government", tags: ["Government", "Certification", "All Subjects"] },
  { name: "DIKSHA Platform", url: "https://diksha.gov.in/", description: "NCERT textbooks, school learning resources in multiple Indian languages. Official MHRD initiative.", category: "school", source: "government", tags: ["NCERT", "School", "Multilingual"] },
  { name: "National Digital Library of India", url: "https://ndl.iitkgp.ac.in/", description: "Access millions of academic books, research papers, and PDFs for free. Managed by IIT Kharagpur.", category: "government_exams", source: "government", tags: ["Books", "Research", "Academic"] },
  { name: "ePathshala", url: "https://epathshala.nic.in/", description: "Official NCERT e-textbooks and audio-visual content for classes 1–12 in Hindi, English & Urdu.", category: "school", source: "government", tags: ["NCERT", "Textbooks", "Free"] },
  { name: "NPTEL", url: "https://nptel.ac.in/", description: "IIT & IISc lectures on engineering, science, humanities. Get NPTEL certificates for career enhancement.", category: "technical", source: "government", tags: ["IIT", "Engineering", "Lectures"] },
  { name: "NIOS (National Institute of Open Schooling)", url: "https://www.nios.ac.in/", description: "Open schooling courses for secondary and senior secondary education recognized by the Government of India.", category: "school", source: "government", tags: ["Open School", "Board Exam", "Government"] },
  { name: "Spoken Tutorial (IIT Bombay)", url: "https://spoken-tutorial.org/", description: "Free software training on Linux, Python, LibreOffice, C, C++ and more by IIT Bombay.", category: "coding", source: "government", tags: ["IIT Bombay", "Software", "Free Training"] },
  // 🌍 Global Free Learning
  { name: "Khan Academy", url: "https://www.khanacademy.org/", description: "World-class maths, science, economics, and computer science courses. Completely free, forever.", category: "school", source: "global", tags: ["Maths", "Science", "Economics"] },
  { name: "freeCodeCamp", url: "https://www.freecodecamp.org/", description: "Learn coding, web development, AI, and data science. Earn free certifications with hands-on projects.", category: "coding", source: "global", tags: ["Coding", "Web Dev", "AI"] },
  { name: "W3Schools", url: "https://www.w3schools.com/", description: "Interactive tutorials on HTML, CSS, JavaScript, Python, SQL and more. Perfect for beginners.", category: "coding", source: "global", tags: ["HTML", "CSS", "JavaScript", "Python"] },
  { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", description: "Free course materials from MIT. Access lectures, notes, and assignments from world-renowned professors.", category: "technical", source: "global", tags: ["MIT", "University", "Advanced"] },
  { name: "Coursera (Free Courses)", url: "https://www.coursera.org/courses?query=free", description: "Audit hundreds of courses from top universities for free. Includes Stanford, Yale, and Google courses.", category: "technical", source: "global", tags: ["University", "Free Audit", "Certificates"] },
  { name: "edX Free Courses", url: "https://www.edx.org/search?tab=course", description: "Free courses from Harvard, MIT, IITs and more. Learn at your own pace with video lectures.", category: "technical", source: "global", tags: ["Harvard", "MIT", "IIT"] },
  // 🎯 Competitive / Aptitude
  { name: "IndiaBix", url: "https://www.indiabix.com/", description: "Comprehensive aptitude, logical reasoning, verbal ability and interview preparation resources.", category: "aptitude", source: "competitive", tags: ["Aptitude", "Reasoning", "Interview"] },
  { name: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/", description: "DSA, coding interview prep, competitive programming, and CS fundamentals for placements.", category: "coding", source: "competitive", tags: ["DSA", "Coding", "Placements"] },
  { name: "Testbook (Free Resources)", url: "https://testbook.com/", description: "Free mock tests and study material for government exams — SSC, Banking, Railways, UPSC.", category: "government_exams", source: "competitive", tags: ["SSC", "Banking", "Mock Tests"] },
  // Resume & Interview
  { name: "Google Interview Warmup", url: "https://grow.google/certificates/interview-warmup/", description: "Practice answering interview questions with Google's AI tool. Instant feedback on your answers.", category: "resume_interview", source: "global", tags: ["Interview", "Google", "AI Practice"] },
  { name: "Harvard Resume Guide", url: "https://careerservices.fas.harvard.edu/resources/resume-cover-letter-resources/", description: "Free resume writing guides from Harvard Career Services. Templates and best practices.", category: "resume_interview", source: "global", tags: ["Resume", "Harvard", "Templates"] },

  // 🎥 YouTube Channels — Government Exams
  { name: "NPTEL Official", url: "https://www.youtube.com/@npabornepal", description: "Official IIT/IISc lecture series. Engineering, science, and management courses.", category: "youtube", source: "youtube", tags: ["IIT", "Engineering", "Govt Exams"] },
  { name: "Unacademy JEE", url: "https://www.youtube.com/@UnacademyJEE", description: "Free JEE preparation lectures from top educators.", category: "youtube", source: "youtube", tags: ["JEE", "Engineering", "Govt Exams"] },
  { name: "Unacademy NEET", url: "https://www.youtube.com/@UnacademyNEET", description: "Free NEET preparation — biology, chemistry, physics for medical aspirants.", category: "youtube", source: "youtube", tags: ["NEET", "Medical", "Govt Exams"] },
  { name: "Unacademy UPSC", url: "https://www.youtube.com/@UnacademyIAS", description: "Free UPSC Civil Services preparation from India's top IAS educators.", category: "youtube", source: "youtube", tags: ["UPSC", "IAS", "Govt Exams"] },
  { name: "StudyIQ IAS", url: "https://www.youtube.com/@StudyIQIAS", description: "Comprehensive UPSC, SSC, Banking exam preparation and current affairs.", category: "youtube", source: "youtube", tags: ["UPSC", "SSC", "Current Affairs"] },
  { name: "Adda247", url: "https://www.youtube.com/@adabornepal247", description: "SSC, Banking, Railways, UPSC and State PCS exam preparation.", category: "youtube", source: "youtube", tags: ["SSC", "Banking", "Railways"] },
  { name: "Wifistudy", url: "https://www.youtube.com/@wifistudy", description: "Free classes for SSC, Railway, Banking and all competitive exams.", category: "youtube", source: "youtube", tags: ["SSC", "Railway", "Competitive"] },

  // 🎥 YouTube — School & CBSE/NCERT
  { name: "Khan Academy India (Hindi)", url: "https://www.youtube.com/@KhanAcademyIndiaHindi", description: "Khan Academy's Hindi content for CBSE, NCERT maths, and science.", category: "youtube", source: "youtube", tags: ["Hindi", "CBSE", "School"] },
  { name: "Khan Academy India (English)", url: "https://www.youtube.com/@KhanAcademyIndia", description: "Khan Academy India in English — CBSE board maths, science, and economics.", category: "youtube", source: "youtube", tags: ["English", "CBSE", "School"] },
  { name: "Vedantu", url: "https://www.youtube.com/@VedantuMaster", description: "Free live classes for CBSE, ICSE, JEE, and NEET by top teachers.", category: "youtube", source: "youtube", tags: ["CBSE", "ICSE", "Live Classes"] },
  { name: "Physics Wallah", url: "https://www.youtube.com/@PhysicsWallah", description: "Free JEE & NEET lectures by Alakh Pandey. Hugely popular for physics & chemistry.", category: "youtube", source: "youtube", tags: ["JEE", "NEET", "Physics"] },
  { name: "Byju's Free Classes", url: "https://www.youtube.com/@BYJUSExamPrep", description: "Free exam preparation classes for UPSC, SSC, Banking, and state exams.", category: "youtube", source: "youtube", tags: ["UPSC", "SSC", "Exam Prep"] },

  // 🎥 YouTube — Coding & Tech
  { name: "freeCodeCamp (YouTube)", url: "https://www.youtube.com/@freecodecamp", description: "Full-length coding tutorials on Python, JavaScript, React, Machine Learning, and more.", category: "youtube", source: "youtube", tags: ["Coding", "Python", "JavaScript"] },
  { name: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia", description: "Web development crash courses — HTML, CSS, JavaScript, React, Node.js.", category: "youtube", source: "youtube", tags: ["Web Dev", "React", "Node.js"] },
  { name: "The Coding Train", url: "https://www.youtube.com/@TheCodingTrain", description: "Creative coding tutorials — p5.js, algorithms, simulations in a fun style.", category: "youtube", source: "youtube", tags: ["Creative Coding", "p5.js", "Fun"] },
  { name: "Fireship", url: "https://www.youtube.com/@Fireship", description: "Fast-paced tech explainers — 100 seconds of code, web dev, and industry trends.", category: "youtube", source: "youtube", tags: ["Tech News", "Quick Tutorials", "Web Dev"] },
  { name: "CodeWithHarry", url: "https://www.youtube.com/@CodeWithHarry", description: "Hindi coding tutorials — Python, Java, C, Web Dev, DSA for Indian students.", category: "youtube", source: "youtube", tags: ["Hindi", "Python", "DSA"] },
  { name: "Apna College", url: "https://www.youtube.com/@ApnaCollegeOfficial", description: "Complete DSA, Java, C++, Web Development courses in Hindi. Free placement prep.", category: "youtube", source: "youtube", tags: ["DSA", "Java", "Placements"] },
  { name: "Telusko", url: "https://www.youtube.com/@Telusko", description: "Java, Python, Spring Boot, and full-stack development tutorials.", category: "youtube", source: "youtube", tags: ["Java", "Spring Boot", "Full Stack"] },
  { name: "Programming with Mosh", url: "https://www.youtube.com/@programmingwithmosh", description: "Clean, well-structured tutorials on Python, JavaScript, React, C#, and more.", category: "youtube", source: "youtube", tags: ["Python", "React", "C#"] },

  // 🎥 YouTube — Aptitude & Reasoning
  { name: "CareerRide", url: "https://www.youtube.com/@CareerRide", description: "Aptitude, reasoning, and verbal ability tutorials for placement preparation.", category: "youtube", source: "youtube", tags: ["Aptitude", "Reasoning", "Placements"] },
  { name: "Placement Season", url: "https://www.youtube.com/@PlacementSeason", description: "Quantitative aptitude and logical reasoning for campus placements.", category: "youtube", source: "youtube", tags: ["Aptitude", "Campus Placement", "Quant"] },
  { name: "Lofoya (Feel Free to Learn)", url: "https://www.youtube.com/@Lofoya", description: "Aptitude shortcuts, reasoning tricks, and interview preparation.", category: "youtube", source: "youtube", tags: ["Shortcuts", "Tricks", "Aptitude"] },

  // 🎥 YouTube — English & Communication
  { name: "English with Lucy", url: "https://www.youtube.com/@EnglishwithLucy", description: "Improve English speaking, grammar, vocabulary with clear British English lessons.", category: "youtube", source: "youtube", tags: ["English", "Speaking", "Grammar"] },
  { name: "BBC Learning English", url: "https://www.youtube.com/@bbclearningenglish", description: "Official BBC channel for English learning — pronunciation, grammar, vocabulary.", category: "youtube", source: "youtube", tags: ["BBC", "English", "Vocabulary"] },

  // 🎥 YouTube — Career & Interview
  { name: "The Urban Fight", url: "https://www.youtube.com/@TheUrbanFight", description: "Interview preparation, resume tips, career guidance for Indian students.", category: "youtube", source: "youtube", tags: ["Interview", "Resume", "Career"] },
  { name: "Ankur Warikoo", url: "https://www.youtube.com/@waabornepal", description: "Career advice, productivity, financial literacy, and entrepreneurship for Indian youth.", category: "youtube", source: "youtube", tags: ["Career", "Productivity", "Finance"] },
];

const CATEGORIES: { value: Category; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All Resources", icon: BookOpen },
  { value: "government_exams", label: "Govt Exams", icon: Shield },
  { value: "technical", label: "Technical", icon: Laptop },
  { value: "aptitude", label: "Aptitude", icon: Brain },
  { value: "resume_interview", label: "Resume & Interview", icon: FileText },
  { value: "school", label: "School", icon: School },
  { value: "coding", label: "Coding", icon: Code },
  { value: "youtube", label: "YouTube Channels", icon: Youtube },
];

const sourceColors: Record<string, string> = {
  government: "bg-success/10 text-success border-success/20",
  global: "bg-primary/10 text-primary border-primary/20",
  competitive: "bg-accent/10 text-accent border-accent/20",
  youtube: "bg-destructive/10 text-destructive border-destructive/20",
};

const sourceLabels: Record<string, string> = {
  government: "🇮🇳 Government",
  global: "🌍 Global",
  competitive: "🎯 Competitive",
  youtube: "🎥 YouTube",
};

const StudyMaterials = () => {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      const matchesCategory = category === "all" || r.category === category || (category === "youtube" && r.source === "youtube");
      const matchesSearch = !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const youtubeCount = RESOURCES.filter(r => r.source === "youtube").length;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Free Study Materials - AVSAR | Trusted Government & Global Resources"
        description="Access free study materials from SWAYAM, NPTEL, Khan Academy, freeCodeCamp and more. Trusted government and global educational resources for Indian students."
        keywords="free study materials, NPTEL courses, SWAYAM, Khan Academy India, free coding courses, government exam preparation, NCERT books online, aptitude preparation"
      />
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-medium mb-4">
            <Shield className="h-3 w-3" />
            100% Free & Legal Resources
          </div>
          <h1 className="font-heading text-title text-foreground mb-2">Free Study Materials</h1>
          <p className="text-muted-foreground max-w-2xl">
            Curated collection of trusted, free educational resources from government portals,
            globally recognized platforms, and {youtubeCount}+ YouTube channels. All links open official websites.
          </p>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button key={cat.value} variant={category === cat.value ? "default" : "outline"} size="sm" onClick={() => setCategory(cat.value)} className="gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
                {cat.value === "youtube" && <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0">{youtubeCount}</Badge>}
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource) => (
            <Card key={resource.url} className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                    {resource.source === "youtube" && <Youtube className="inline h-4 w-4 mr-1.5 text-destructive" />}
                    {resource.name}
                  </h3>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${sourceColors[resource.source]}`}>
                    {sourceLabels[resource.source]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">{resource.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {resource.tags.map((tag) => (<Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>))}
                </div>
                <Button asChild size="sm" variant="outline" className="w-full group/btn">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.source === "youtube" ? <Youtube className="mr-2 h-3.5 w-3.5" /> : <Globe className="mr-2 h-3.5 w-3.5" />}
                    {resource.source === "youtube" ? "Visit Channel" : "Visit Resource"}
                    <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                  </a>
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-2">External Free Resource — opens in new tab</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-30" />
            <p>No resources found. Try a different search or category.</p>
          </div>
        )}

        <div className="mt-12 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> AVSAR only links to official, publicly available, and free educational resources.
            We do not host or upload any copyrighted content. All resources open their respective official websites in a new tab.
            AVSAR is not affiliated with any of these platforms.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudyMaterials;
