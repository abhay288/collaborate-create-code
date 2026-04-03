import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Keyboard, Clock, Target, RefreshCw, Zap, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SPEED_PARAGRAPHS = [
  "In today's competitive job market, having strong communication skills is essential for career success. Employers value candidates who can articulate their ideas clearly and work effectively in team environments. Building these skills requires consistent practice and a willingness to step outside your comfort zone.",
  "Technology continues to reshape the way we work and learn. Professionals who embrace continuous learning and adapt to new tools will find themselves at a significant advantage. The ability to combine technical expertise with creative problem-solving is becoming increasingly valuable across all industries.",
  "Effective leadership is not about having all the answers but about asking the right questions. Great leaders inspire their teams by setting a clear vision, providing support, and fostering an environment where innovation can thrive. They understand that success is built on trust and collaboration.",
  "Data-driven decision making has become the cornerstone of modern business strategy. Organizations that leverage analytics to understand customer behavior, market trends, and operational efficiency gain a competitive edge. The key lies in translating complex data into actionable insights that drive growth.",
];

type Mode = "select" | "speed" | "professional" | "speed_result" | "pro_result";

interface SpeedResult { wpm: number; accuracy: number; errorCount: number; totalChars: number; correctChars: number; }
interface ProResult {
  writing_clarity: number; professional_tone: number; grammar_accuracy: number;
  structure_quality: number; vocabulary_strength: string; strengths: string[];
  improvements: string[]; rewritten_version: string; readiness_score: number;
  career_impact: string;
}

const TypingTestPage = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("select");
  const [paragraph, setParagraph] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timerDuration, setTimerDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerStarted, setTimerStarted] = useState(false);
  const [speedResult, setSpeedResult] = useState<SpeedResult | null>(null);
  const [proPrompt] = useState("Explain why you are suitable for your desired career and what unique value you can bring to the role.");
  const [proText, setProText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [proResult, setProResult] = useState<ProResult | null>(null);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [liveErrors, setLiveErrors] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentInputRef = useRef("");

  // Sync ref with current input to avoid stale closures in timer
  useEffect(() => {
    currentInputRef.current = userInput;
  }, [userInput]);

  // Speed Mode - prepare but don't start timer
  const startSpeedTest = useCallback(() => {
    const p = SPEED_PARAGRAPHS[Math.floor(Math.random() * SPEED_PARAGRAPHS.length)];
    setParagraph(p);
    setUserInput("");
    setTimeLeft(timerDuration);
    setTimerStarted(false);
    setMode("speed");
    setLiveWpm(0);
    setLiveAccuracy(100);
    setLiveErrors(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [timerDuration]);

  // Timer effect - only runs when timerStarted is true
  useEffect(() => {
    if (!timerStarted || mode !== "speed") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { finishSpeedTest(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerStarted, mode]);

  const handleSpeedInput = (value: string) => {
    if (timeLeft <= 0 && timerStarted) return;
    
    // Start timer on first character
    if (!timerStarted && value.length >= 1) {
      setTimerStarted(true);
      startTimeRef.current = Date.now();
    }
    
    setUserInput(value);
    
    if (!timerStarted && value.length === 0) return;
    
    // Live WPM
    const elapsed = (Date.now() - startTimeRef.current) / 60000;
    const words = value.trim().split(/\s+/).filter(Boolean).length;
    setLiveWpm(elapsed > 0 ? Math.round(words / elapsed) : 0);
    // Live errors & accuracy
    let errors = 0;
    for (let i = 0; i < value.length; i++) {
      if (i < paragraph.length && value[i] !== paragraph[i]) errors++;
    }
    setLiveErrors(errors);
    const correctChars = value.length - errors;
    setLiveAccuracy(value.length > 0 ? Math.round((correctChars / value.length) * 100) : 100);
    // Auto-finish if done
    if (value.length >= paragraph.length) finishSpeedTest(value);
  };

  const finishSpeedTest = (text?: string) => {
    setTimerStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const input = text !== undefined ? text : currentInputRef.current;
    const totalChars = input.length;
    let correctChars = 0;
    for (let i = 0; i < totalChars; i++) {
      if (i < paragraph.length && input[i] === paragraph[i]) correctChars++;
    }
    const elapsed = (Date.now() - startTimeRef.current) / 60000;
    const wpm = elapsed > 0 ? Math.round((totalChars / 5) / elapsed) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    setSpeedResult({ wpm, accuracy, errorCount: totalChars - correctChars, totalChars, correctChars });
    setMode("speed_result");
  };

  // Professional Mode
  const analyzeWriting = async () => {
    if (proText.trim().split(/\s+/).length < 50) {
      toast.error("Please write at least 50 words.");
      return;
    }
    setIsAnalyzing(true);
    setMode("pro_result");
    try {
      const { data, error } = await supabase.functions.invoke("career-insights", {
        body: { action: "typing_analysis", text: proText.trim() },
      });
      if (error) throw error;
      setProResult(data);
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
      setMode("professional");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => { setMode("select"); setUserInput(""); setProText(""); setSpeedResult(null); setProResult(null); setLiveWpm(0); setLiveErrors(0); setLiveAccuracy(100); setTimerStarted(false); setTimeLeft(timerDuration); };

  // Render highlighted text for speed mode
  const renderHighlightedText = () => {
    return paragraph.split("").map((char, i) => {
      let cls = "text-muted-foreground";
      if (i < userInput.length) {
        cls = userInput[i] === char ? "text-green-600 bg-green-500/10" : "text-red-500 bg-red-500/10 underline";
      } else if (i === userInput.length) {
        cls = "bg-primary/20 text-foreground border-l-2 border-primary";
      }
      return <span key={i} className={cls}>{char}</span>;
    });
  };

  const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
    <div>
      <div className="flex justify-between text-sm mb-1"><span>{label}</span><span className="font-bold">{score}/100</span></div>
      <Progress value={score} className={`h-2 [&>div]:${color}`} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>/</span><span className="text-foreground">Typing Test</span>
        </div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        </Button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent mb-2">⌨️ Typing Test (AI Evaluated)</h1>
          <p className="text-muted-foreground">Measure speed, accuracy & professional writing quality</p>
        </div>

        {/* Mode Selection */}
        {mode === "select" && (
          <div className="space-y-6 animate-fade-in">
            {/* Timer Duration Selector */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Test Duration:</span>
                  </div>
                  <div className="flex gap-2">
                    {[30, 60, 90, 120].map(duration => (
                      <Button
                        key={duration}
                        variant={timerDuration === duration ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimerDuration(duration)}
                      >
                        {duration}s
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-teal-500/20 hover:border-teal-500/50 transition-all cursor-pointer group" onClick={startSpeedTest}>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-10 w-10 text-teal-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">⚡ Speed Mode</h3>
                  <p className="text-sm text-muted-foreground mb-4">{timerDuration}-second typing speed test with accuracy tracking</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">WPM</Badge><Badge variant="outline">Accuracy</Badge><Badge variant="outline">{timerDuration} sec</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer group" onClick={() => setMode("professional")}>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">📝 Professional Writing</h3>
                  <p className="text-sm text-muted-foreground mb-4">AI-evaluated writing quality, grammar & professional tone</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">AI Analysis</Badge><Badge variant="outline">Grammar</Badge><Badge variant="outline">Rewrite</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Speed Mode */}
        {mode === "speed" && (
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-teal-500" />Speed Test</CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg px-3"><Clock className="h-4 w-4 mr-1" />{timeLeft}s</Badge>
                  <Badge className="bg-teal-500">{liveWpm} WPM</Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600">{liveAccuracy}%</Badge>
                  {liveErrors > 0 && <Badge variant="destructive">{liveErrors} errors</Badge>}
                </div>
              </div>
              {!timerStarted && (
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timer will start when you type the first letter.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/50 border mb-4 font-mono text-base leading-relaxed select-none">
                {renderHighlightedText()}
              </div>
              <Progress value={((paragraph.length - (paragraph.length - userInput.length)) / paragraph.length) * 100} className="h-1 mb-4" />
              <Textarea ref={inputRef} value={userInput} onChange={e => handleSpeedInput(e.target.value)}
                placeholder="Start typing here... (timer begins on first key)" className="font-mono text-base" rows={4}
                disabled={timeLeft <= 0 && timerStarted} autoFocus onPaste={e => e.preventDefault()} />
              <div className="flex gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={resetAll}><RefreshCw className="mr-2 h-4 w-4" />Reset</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Speed Result */}
        {mode === "speed_result" && speedResult && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="text-center border-teal-500/20">
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-teal-500">{speedResult.wpm}</p>
                  <p className="text-sm text-muted-foreground">Words Per Minute</p>
                  <Badge variant="outline" className="mt-2">{speedResult.wpm > 60 ? "Fast" : speedResult.wpm > 40 ? "Average" : "Needs Practice"}</Badge>
                </CardContent>
              </Card>
              <Card className="text-center border-green-500/20">
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-green-500">{speedResult.accuracy}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <Badge variant="outline" className="mt-2">{speedResult.accuracy > 95 ? "Excellent" : speedResult.accuracy > 85 ? "Good" : "Needs Work"}</Badge>
                </CardContent>
              </Card>
              <Card className="text-center border-red-500/20">
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-red-500">{speedResult.errorCount}</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                  <p className="text-xs text-muted-foreground mt-1">{speedResult.correctChars}/{speedResult.totalChars} correct</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetAll}><RefreshCw className="mr-2 h-4 w-4" />Try Again</Button>
              <Button onClick={() => setMode("professional")} className="bg-gradient-to-r from-blue-500 to-purple-500">
                <FileText className="mr-2 h-4 w-4" />Try Professional Mode
              </Button>
            </div>
          </div>
        )}

        {/* Professional Mode */}
        {mode === "professional" && (
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-500" />Professional Writing Mode</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetAll} title="Start Fresh Analysis"><RefreshCw className="h-4 w-4" /></Button>
              </div>
              <CardDescription>Write your response to the prompt below (minimum 50 words)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 mb-4">
                <p className="font-medium">📝 Prompt:</p>
                <p className="text-sm text-muted-foreground mt-1">{proPrompt}</p>
              </div>
              <div className="relative">
                <Textarea value={proText} onChange={e => setProText(e.target.value)} placeholder="Start writing your response..."
                  className="font-sans text-base min-h-[200px]" rows={8} />
                <div className="absolute bottom-2 right-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{proText.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>{proText.length} chars</span>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={resetAll}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <Button onClick={analyzeWriting} className="bg-gradient-to-r from-blue-600 to-purple-600" disabled={proText.trim().split(/\s+/).filter(Boolean).length < 50}>
                  <Target className="mr-2 h-4 w-4" />Analyze Writing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pro Result */}
        {mode === "pro_result" && (
          <div className="space-y-6 animate-fade-in">
            {isAnalyzing ? (
              <Card>
                <CardContent className="p-8 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Analyzing Writing Quality...</h3>
                  <Skeleton className="h-4 w-full mt-4" /><Skeleton className="h-4 w-3/4 mt-2" /><Skeleton className="h-4 w-5/6 mt-2" />
                </CardContent>
              </Card>
            ) : proResult && (
              <>
                {/* Readiness */}
                <div className="text-center">
                  <Badge className="text-lg px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500">
                    🎯 Placement Readiness: {proResult.readiness_score}/100
                  </Badge>
                </div>
                {/* Scores */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Writing Quality Scores</CardTitle>
                      <Button variant="ghost" size="sm" onClick={resetAll} title="Start Fresh Analysis"><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScoreBar label="Writing Clarity" score={proResult.writing_clarity} color="bg-blue-500" />
                    <ScoreBar label="Professional Tone" score={proResult.professional_tone} color="bg-purple-500" />
                    <ScoreBar label="Grammar Accuracy" score={proResult.grammar_accuracy} color="bg-green-500" />
                    <ScoreBar label="Structure Quality" score={proResult.structure_quality} color="bg-amber-500" />
                    <div className="flex justify-between text-sm"><span>Vocabulary Strength</span><Badge variant="outline">{proResult.vocabulary_strength}</Badge></div>
                  </CardContent>
                </Card>
                {/* Career Impact */}
                {proResult.career_impact && (
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">📈 Communication Skill Impact on Your Career:</p>
                      <p className="text-sm text-muted-foreground mt-1">{proResult.career_impact}</p>
                    </CardContent>
                  </Card>
                )}
                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-green-500/20">
                    <CardHeader><CardTitle className="text-base">💪 Strengths</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2">{proResult.strengths.map((s, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-green-500">✓</span>{s}</li>)}</ul>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-500/20">
                    <CardHeader><CardTitle className="text-base">📈 Improvements</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2">{proResult.improvements.map((s, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-amber-500">→</span>{s}</li>)}</ul>
                    </CardContent>
                  </Card>
                </div>
                {/* Rewritten Version */}
                {proResult.rewritten_version && (
                  <Card className="border-blue-500/20">
                    <CardHeader><CardTitle className="text-base">✨ AI-Improved Version</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{proResult.rewritten_version}</p>
                    </CardContent>
                  </Card>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetAll}><RefreshCw className="mr-2 h-4 w-4" />Try Again</Button>
                  <Button asChild className="bg-gradient-to-r from-teal-500 to-blue-500">
                    <Link to="/resume-builder"><FileText className="mr-2 h-4 w-4" />Build Resume</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TypingTestPage;
