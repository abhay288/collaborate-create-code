import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Eye, FileText, User, Briefcase, GraduationCap, Star, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ResumeData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string;
  education: string;
  experience: string;
  projects: string;
  certifications: string;
};

const TEMPLATES = [
  { id: "professional", name: "Professional", color: "from-blue-600 to-blue-800" },
  { id: "modern", name: "Modern", color: "from-emerald-600 to-teal-700" },
  { id: "minimal", name: "Minimal", color: "from-gray-700 to-gray-900" },
];

const ResumeBuilder = () => {
  const { user } = useAuth();
  const [template, setTemplate] = useState("professional");
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ResumeData>({
    fullName: "", email: "", phone: "", location: "",
    summary: "", skills: "", education: "", experience: "",
    projects: "", certifications: "",
  });

  // Auto-fill from profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) {
        setData(prev => ({
          ...prev,
          fullName: profile.full_name || prev.fullName,
          email: user.email || prev.email,
          location: [profile.preferred_district, profile.preferred_state].filter(Boolean).join(", ") || prev.location,
          skills: profile.interests?.join(", ") || prev.skills,
        }));
      }
    })();
  }, [user]);

  const update = (field: keyof ResumeData, value: string) => setData(prev => ({ ...prev, [field]: value }));

  const downloadPDF = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Please allow popups"); return; }
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>${data.fullName || "Resume"}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; line-height: 1.6; }
        .resume { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid ${template === "professional" ? "#1e40af" : template === "modern" ? "#059669" : "#374151"}; }
        .header h1 { font-size: 28px; font-weight: 700; color: ${template === "professional" ? "#1e40af" : template === "modern" ? "#059669" : "#111"}; }
        .header .contact { font-size: 13px; color: #666; margin-top: 8px; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${template === "professional" ? "#1e40af" : template === "modern" ? "#059669" : "#111"}; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; }
        .section p, .section li { font-size: 13px; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { background: #f0f0f0; padding: 3px 10px; border-radius: 4px; font-size: 12px; }
        ul { padding-left: 20px; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style></head><body>
      ${printRef.current.innerHTML}
      <script>window.onload = function() { window.print(); window.close(); }</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const skillsList = data.skills.split(",").map(s => s.trim()).filter(Boolean);
  const accentColor = template === "professional" ? "text-blue-700" : template === "modern" ? "text-emerald-700" : "text-foreground";
  const borderColor = template === "professional" ? "border-blue-700" : template === "modern" ? "border-emerald-600" : "border-foreground";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild><Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-2xl font-bold">Resume Builder</h1>
            <p className="text-sm text-muted-foreground">Create a professional resume with AI auto-fill</p>
          </div>
        </div>

        {/* Template Selection */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTemplate(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${template === t.id ? "border-primary bg-primary/10 text-primary" : "border-muted hover:border-primary/40"}`}>
              {t.name}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="gap-2">
              <Eye className="h-4 w-4" />{showPreview ? "Edit" : "Preview"}
            </Button>
            <Button onClick={downloadPDF} className="gap-2"><Download className="h-4 w-4" />Download PDF</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          {!showPreview && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />Personal Info</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Full Name</Label><Input value={data.fullName} onChange={e => update("fullName", e.target.value)} placeholder="John Doe" /></div>
                    <div><Label>Email</Label><Input value={data.email} onChange={e => update("email", e.target.value)} placeholder="john@example.com" /></div>
                    <div><Label>Phone</Label><Input value={data.phone} onChange={e => update("phone", e.target.value)} placeholder="+91 9876543210" /></div>
                    <div><Label>Location</Label><Input value={data.location} onChange={e => update("location", e.target.value)} placeholder="City, State" /></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Summary</CardTitle></CardHeader>
                <CardContent><Textarea value={data.summary} onChange={e => update("summary", e.target.value)} placeholder="A brief professional summary..." rows={3} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" />Skills (comma separated)</CardTitle></CardHeader>
                <CardContent><Textarea value={data.skills} onChange={e => update("skills", e.target.value)} placeholder="React, Python, Data Analysis..." rows={2} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4" />Education</CardTitle></CardHeader>
                <CardContent><Textarea value={data.education} onChange={e => update("education", e.target.value)} placeholder="B.Tech in Computer Science, XYZ University, 2024" rows={3} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4" />Experience</CardTitle></CardHeader>
                <CardContent><Textarea value={data.experience} onChange={e => update("experience", e.target.value)} placeholder="Intern at ABC Corp - Built REST APIs..." rows={4} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Projects</CardTitle></CardHeader>
                <CardContent><Textarea value={data.projects} onChange={e => update("projects", e.target.value)} placeholder="Project Name - Description and technologies used" rows={3} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Certifications</CardTitle></CardHeader>
                <CardContent><Textarea value={data.certifications} onChange={e => update("certifications", e.target.value)} placeholder="AWS Certified, Google Analytics..." rows={2} /></CardContent>
              </Card>
            </div>
          )}

          {/* Live Preview */}
          <div className={showPreview ? "lg:col-span-2" : ""}>
            <Card className="sticky top-20 overflow-auto max-h-[80vh]">
              <CardContent className="p-0">
                <div ref={printRef} className="resume p-8 bg-white text-gray-900 min-h-[600px]">
                  {/* Header */}
                  <div className={`text-center mb-6 pb-4 border-b-[3px] ${borderColor}`}>
                    <h1 className={`text-2xl font-bold ${accentColor}`}>{data.fullName || "Your Name"}</h1>
                    <div className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-3 flex-wrap">
                      {data.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{data.email}</span>}
                      {data.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{data.phone}</span>}
                      {data.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{data.location}</span>}
                    </div>
                  </div>

                  {data.summary && (
                    <div className="mb-5">
                      <h2 className={`text-sm font-bold uppercase tracking-wider ${accentColor} border-b border-gray-200 pb-1 mb-2`}>Summary</h2>
                      <p className="text-xs text-gray-700 leading-relaxed">{data.summary}</p>
                    </div>
                  )}

                  {skillsList.length > 0 && (
                    <div className="mb-5">
                      <h2 className={`text-sm font-bold uppercase tracking-wider ${accentColor} border-b border-gray-200 pb-1 mb-2`}>Skills</h2>
                      <div className="skills-list flex flex-wrap gap-1.5">
                        {skillsList.map((s, i) => <span key={i} className="skill-tag bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{s}</span>)}
                      </div>
                    </div>
                  )}

                  {data.education && (
                    <div className="mb-5">
                      <h2 className={`text-sm font-bold uppercase tracking-wider ${accentColor} border-b border-gray-200 pb-1 mb-2`}>Education</h2>
                      <p className="text-xs text-gray-700 whitespace-pre-line">{data.education}</p>
                    </div>
                  )}

                  {data.experience && (
                    <div className="mb-5">
                      <h2 className={`text-sm font-bold uppercase tracking-wider ${accentColor} border-b border-gray-200 pb-1 mb-2`}>Experience</h2>
                      <p className="text-xs text-gray-700 whitespace-pre-line">{data.experience}</p>
                    </div>
                  )}

                  {data.projects && (
                    <div className="mb-5">
                      <h2 className={`text-sm font-bold uppercase tracking-wider ${accentColor} border-b border-gray-200 pb-1 mb-2`}>Projects</h2>
                      <p className="text-xs text-gray-700 whitespace-pre-line">{data.projects}</p>
                    </div>
                  )}

                  {data.certifications && (
                    <div className="mb-5">
                      <h2 className={`text-sm font-bold uppercase tracking-wider ${accentColor} border-b border-gray-200 pb-1 mb-2`}>Certifications</h2>
                      <p className="text-xs text-gray-700 whitespace-pre-line">{data.certifications}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResumeBuilder;
