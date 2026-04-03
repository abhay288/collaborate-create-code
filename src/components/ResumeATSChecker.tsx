import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download,
  Loader2,
  Sparkles,
  Target,
  Zap,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ATSAnalysis {
  score: number;
  sections: {
    name: string;
    score: number;
    maxScore: number;
    feedback: string[];
    status: 'good' | 'warning' | 'critical';
  }[];
  suggestions: string[];
  keywords: {
    found: string[];
    missing: string[];
  };
  formatting: {
    issues: string[];
    good: string[];
  };
}

export default function ResumeATSChecker() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [targetRole, setTargetRole] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
    setAnalysis(null);
  };

  const analyzeResume = async () => {
    if (!file || !user) {
      toast.error('Please upload a resume first');
      return;
    }

    setAnalyzing(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call edge function to analyze resume
      // SECURITY: userId is derived from JWT on the server, never sent from client
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { 
          fileContent,
          fileName: file.name,
          fileType: file.type,
          targetRole: targetRole || "General Professional"
        }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        toast.success('Resume analyzed successfully!');
      } else {
        throw new Error('No analysis data received');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const downloadChecklist = () => {
    if (!analysis) return;
    
    const content = `AVSAR Resume ATS Score Checklist
================================
Overall Score: ${analysis.score}/100

IMPROVEMENT SUGGESTIONS:
${analysis.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

KEYWORDS TO ADD:
${analysis.keywords.missing.join(', ')}

FORMATTING IMPROVEMENTS:
${analysis.formatting.issues.join('\n')}

Generated by AVSAR - AI Career Guidance Platform
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-improvement-checklist.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Checklist downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Resume ATS Score Checker
          </CardTitle>
          <CardDescription>
            Upload your resume to get an ATS compatibility score and actionable improvement suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="target-role" className="text-sm font-medium">Target Job Role (Optional)</Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="target-role"
                  placeholder="e.g. Software Engineer, Marketing Manager..." 
                  className="pl-9"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Providing a role helps us match specific industry keywords more accurately.</p>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileInput}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {file ? file.name : 'Drop your resume here or click to upload'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports PDF and DOCX (Max 5MB)
                  </p>
                </div>
                {file && (
                  <div className="flex items-center gap-2 text-green-600">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">File ready for analysis</span>
                  </div>
                )}
              </div>
            </label>
          </div>

          {file && (
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:shadow-lg"
              onClick={analyzeResume}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-fade-up">
          {/* Overall Score */}
          <Card className="border-primary/20 overflow-hidden">
            <div className={`p-6 bg-gradient-to-r ${getScoreGradient(analysis.score)} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">ATS Compatibility Score</p>
                  <p className="text-5xl font-bold mt-1">{analysis.score}<span className="text-2xl">/100</span></p>
                </div>
                <div className="p-4 bg-white/20 rounded-full">
                  <Target className="h-12 w-12" />
                </div>
              </div>
              <Progress 
                value={analysis.score} 
                className="mt-4 h-3 bg-white/30 [&>div]:bg-white"
              />
            </div>
          </Card>

          {/* Section Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Section-wise Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.sections.map((section, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(section.status)}
                      <span className="font-medium">{section.name}</span>
                    </div>
                    <span className={`font-bold ${getScoreColor(section.score)}`}>
                      {section.score}%
                    </span>
                  </div>
                  <Progress 
                    value={section.score} 
                    className="h-2 mb-3"
                  />
                  <ul className="space-y-1">
                    {section.feedback.map((fb, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                        {fb}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Keywords */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Keywords Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.found.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  Missing Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.missing.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="border-amber-500 text-amber-600">
                      + {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-primary/30 bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertDescription>
                  Implement these suggestions to improve your ATS score and increase your chances of getting shortlisted.
                </AlertDescription>
              </Alert>
              <ul className="space-y-3">
                {analysis.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={downloadChecklist}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Improvement Checklist
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
