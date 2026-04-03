import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Mic, ArrowRight, ArrowLeft, CheckCircle2, Clock, Target,
  TrendingUp, AlertTriangle, Award, BarChart3, Loader2, Play
} from "lucide-react";

const ROLES = [
  "Software Engineer", "Data Analyst", "Data Scientist", "Web Developer",
  "MBA Graduate", "Government Officer (UPSC)", "Bank PO", "SSC CGL",
  "Civil Engineer", "Mechanical Engineer", "Teacher", "Digital Marketer",
  "UI/UX Designer", "Product Manager", "Business Analyst"
];

type InterviewState = "setup" | "in_progress" | "reviewing" | "completed";

interface Question {
  id: string;
  question_text: string;
  question_number: number;
  category: string;
  user_answer?: string;
  ai_score?: number;
  ai_feedback?: string;
}

interface InterviewResult {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  feedback_summary: string;
}

export default function MockInterview() {
  const { session } = useAuth();
  const [state, setState] = useState<InterviewState>("setup");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [interviewId, setInterviewId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [pastInterviews, setPastInterviews] = useState<any[]>([]);

  useEffect(() => {
    loadPastInterviews();
  }, []);

  const loadPastInterviews = async () => {
    const { data } = await supabase
      .from("mock_interviews")
      .select("*")
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5);
    setPastInterviews(data || []);
  };

  const startInterview = async () => {
    if (!role) { toast.error("Select a role first"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mock-interview", {
        body: { action: "generate_questions", role, difficulty },
      });
      if (error) throw error;
      setInterviewId(data.interview.id);
      setQuestions(data.questions);
      setCurrentQ(0);
      setState("in_progress");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) { toast.error("Please write your answer"); return; }
    setEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke("mock-interview", {
        body: { action: "evaluate_answer", role, questionId: questions[currentQ].id, answer },
      });
      if (error) throw error;

      setQuestions(prev => prev.map((q, i) =>
        i === currentQ ? { ...q, user_answer: answer, ai_score: data.score, ai_feedback: data.feedback } : q
      ));
      setState("reviewing");
    } catch (e: any) {
      toast.error(e.message || "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    setAnswer("");
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setState("in_progress");
    } else {
      completeInterview();
    }
  };

  const completeInterview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mock-interview", {
        body: { action: "complete_interview", role, interviewId },
      });
      if (error) throw error;
      setResult(data);
      setState("completed");
      loadPastInterviews();
    } catch (e: any) {
      toast.error(e.message || "Failed to complete");
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setState("setup");
    setQuestions([]);
    setCurrentQ(0);
    setAnswer("");
    setResult(null);
    setInterviewId("");
  };

  const scoreColor = (score: number) =>
    score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-500";

  const scoreBg = (score: number) =>
    score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {state === "setup" && (
          <div className="space-y-8 animate-fade-up">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                AI Mock Interview
              </h1>
              <p className="text-muted-foreground">Practice with AI-powered interviews tailored to your target role</p>
            </div>

            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Select Role & Difficulty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Role</label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue placeholder="Choose a role..." /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <div className="flex gap-3">
                    {["easy", "medium", "hard"].map(d => (
                      <Button
                        key={d}
                        variant={difficulty === d ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDifficulty(d)}
                        className="capitalize flex-1"
                      >
                        {d}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={startInterview} disabled={loading || !role} className="w-full" size="lg">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Questions...</> : <><Play className="mr-2 h-4 w-4" /> Start Interview</>}
                </Button>
              </CardContent>
            </Card>

            {pastInterviews.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Recent Interviews</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {pastInterviews.map(pi => (
                    <div key={pi.id} className="flex items-center justify-between p-3 rounded-lg border border-muted hover:border-primary/30 transition-colors">
                      <div>
                        <p className="font-medium">{pi.role}</p>
                        <p className="text-xs text-muted-foreground capitalize">{pi.difficulty} • {new Date(pi.completed_at).toLocaleDateString()}</p>
                      </div>
                      <Badge className={cn("text-white", scoreBg(pi.overall_score || 0))}>{pi.overall_score}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {state === "in_progress" && questions[currentQ] && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">{role} • {difficulty}</Badge>
              <span className="text-sm text-muted-foreground">Question {currentQ + 1} of {questions.length}</span>
            </div>
            <Progress value={((currentQ + 1) / questions.length) * 100} className="h-2" />

            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <Badge className="w-fit mb-2 capitalize">{questions[currentQ].category}</Badge>
                <CardTitle className="text-xl leading-relaxed">{questions[currentQ].question_text}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here... Be specific and structured."
                  rows={8}
                  className="text-base"
                />
                <div className="flex gap-3">
                  {currentQ > 0 && (
                    <Button variant="outline" onClick={() => { setCurrentQ(prev => prev - 1); setAnswer(questions[currentQ - 1]?.user_answer || ""); setState("in_progress"); }}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                  )}
                  <Button onClick={submitAnswer} disabled={evaluating || !answer.trim()} className="flex-1">
                    {evaluating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...</> : "Submit Answer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {state === "reviewing" && questions[currentQ] && (
          <div className="space-y-6 animate-fade-up">
            <Progress value={((currentQ + 1) / questions.length) * 100} className="h-2" />

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">{questions[currentQ].question_text}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">Your Answer:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{questions[currentQ].user_answer}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className={cn("text-3xl font-bold", scoreColor(questions[currentQ].ai_score || 0))}>
                    {questions[currentQ].ai_score}/100
                  </div>
                  <Progress value={questions[currentQ].ai_score || 0} className="flex-1 h-3" />
                </div>

                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <p className="text-sm font-medium mb-1 flex items-center gap-1"><TrendingUp className="h-4 w-4 text-primary" /> AI Feedback:</p>
                  <p className="text-sm">{questions[currentQ].ai_feedback}</p>
                </div>

                <Button onClick={nextQuestion} className="w-full" size="lg">
                  {currentQ < questions.length - 1 ? <> Next Question <ArrowRight className="ml-2 h-4 w-4" /></> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Complete Interview</>}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {state === "completed" && result && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Interview Complete! 🎉</h2>
              <p className="text-muted-foreground">{role} • {difficulty} difficulty</p>
            </div>

            <Card className="border-primary/20 shadow-xl">
              <CardContent className="pt-8 text-center">
                <div className={cn("text-6xl font-bold mb-2", scoreColor(result.overall_score))}>
                  {result.overall_score}%
                </div>
                <p className="text-muted-foreground mb-6">Overall Score</p>
                <Progress value={result.overall_score} className="h-4 mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" /> Strengths
                    </h3>
                    <ul className="space-y-1">
                      {result.strengths.map((s, i) => <li key={i} className="text-sm flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{s}</li>)}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Areas to Improve
                    </h3>
                    <ul className="space-y-1">
                      {result.improvements.map((s, i) => <li key={i} className="text-sm flex items-start gap-2"><ArrowRight className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />{s}</li>)}
                    </ul>
                  </div>
                </div>

                {result.feedback_summary && (
                  <p className="mt-6 text-sm text-muted-foreground italic p-4 rounded-lg bg-muted/50">{result.feedback_summary}</p>
                )}

                <div className="flex gap-3 mt-8">
                  <Button onClick={resetInterview} className="flex-1" size="lg">
                    <Play className="mr-2 h-4 w-4" /> Practice Again
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Question breakdown */}
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Question Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {questions.filter(q => q.ai_score != null).map((q, i) => (
                  <div key={q.id} className="p-3 rounded-lg border border-muted">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium flex-1">Q{q.question_number}: {q.question_text}</p>
                      <Badge className={cn("shrink-0 text-white", scoreBg(q.ai_score || 0))}>{q.ai_score}%</Badge>
                    </div>
                    {q.ai_feedback && <p className="text-xs text-muted-foreground mt-2">{q.ai_feedback}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {loading && state === "completed" && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Generating your results...</span>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
