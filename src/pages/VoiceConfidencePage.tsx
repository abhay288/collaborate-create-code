import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mic, MicOff, Play, Pause, BarChart3, Brain, Volume2, Clock, RefreshCw, AlertTriangle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

const ROLE_PARAGRAPHS: Record<string, string> = {
  "Software Engineer": "I am passionate about building scalable software systems. I enjoy solving complex problems and continuously improving my technical skills. I believe teamwork and clear communication are essential for successful project delivery. My goal is to contribute to innovative solutions that make a real impact.",
  "Data Analyst": "I am driven by the power of data to uncover meaningful insights. I enjoy transforming raw information into actionable strategies that drive business growth. I believe in combining analytical rigor with clear storytelling to communicate findings effectively. My aim is to help organizations make data-informed decisions.",
  "Data Scientist": "I am fascinated by extracting knowledge from complex datasets using statistical methods and machine learning. I enjoy building predictive models that solve real-world problems. I believe in the power of data to transform industries and create value. My passion lies in turning uncertainty into clarity through rigorous analysis.",
  "AI Engineer": "I am passionate about developing intelligent systems that can learn and adapt. I enjoy working with neural networks, natural language processing, and computer vision technologies. I believe AI has the potential to revolutionize how we solve complex challenges. My goal is to build responsible AI solutions that benefit society.",
  "MBA Graduate": "I am interested in business strategy and leadership development. I aim to contribute to organizational growth through analytical thinking and effective communication. I believe that understanding market dynamics and building strong teams are essential to creating lasting value. My vision is to lead with purpose and innovation.",
  "Civil Services": "I am committed to serving the nation and working for the welfare of citizens. I believe in upholding the principles of justice, integrity, and transparency in public administration. I aim to bridge the gap between policy and implementation to create meaningful impact. My dedication lies in building a more equitable and progressive society.",
  "Teacher": "I am passionate about shaping young minds and fostering a love for learning. I believe every student has unique potential that can be unlocked through encouragement and innovative teaching methods. I strive to create an inclusive classroom environment that promotes critical thinking. My purpose is to inspire the next generation of leaders and thinkers.",
  "Doctor": "I am dedicated to providing compassionate healthcare and improving patient outcomes. I believe in continuous learning and staying updated with the latest medical advancements. I aim to combine clinical expertise with empathy to deliver holistic care. My commitment is to serve communities and contribute to public health improvement.",
  "CA / Finance": "I am passionate about financial analysis and helping organizations achieve fiscal excellence. I believe in maintaining the highest standards of accuracy, compliance, and ethical practice. I aim to provide strategic financial guidance that drives sustainable growth. My expertise lies in turning complex financial data into clear, actionable recommendations.",
  "Marketing Manager": "I am driven by creativity and strategic thinking in building compelling brand experiences. I believe in understanding consumer behavior deeply to craft campaigns that resonate and convert. I aim to leverage both traditional and digital channels for maximum impact. My goal is to create marketing strategies that drive measurable business results.",
  "Product Manager": "I am passionate about building products that solve real user problems and create exceptional experiences. I believe in data-driven decision making combined with deep customer empathy. I aim to bridge the gap between business goals, technology capabilities, and user needs. My focus is on delivering value through iterative product development.",
  "UI/UX Designer": "I am dedicated to creating intuitive and visually appealing digital experiences. I believe great design starts with understanding user needs and business objectives. I aim to combine aesthetic excellence with functional usability in every project. My passion lies in making complex interactions feel simple and delightful for users.",
  "Cybersecurity Analyst": "I am committed to protecting organizations from evolving digital threats and vulnerabilities. I believe in proactive security measures and continuous monitoring to safeguard critical systems. I aim to stay ahead of emerging threats through constant learning and adaptation. My mission is to build robust security frameworks that organizations can trust.",
  "Cloud Engineer": "I am passionate about designing and managing scalable cloud infrastructure solutions. I believe in leveraging cloud technologies to drive efficiency, reliability, and innovation. I aim to optimize systems for performance while maintaining cost-effectiveness and security. My expertise lies in architecting solutions that grow with business needs.",
  "HR Manager": "I am dedicated to building strong organizational cultures and empowering employees to reach their full potential. I believe in creating inclusive workplaces where diversity is celebrated and talent thrives. I aim to align people strategies with business objectives for sustainable growth. My focus is on fostering engagement, development, and well-being.",
  "Business Analyst": "I am passionate about analyzing business processes and identifying opportunities for improvement. I believe in using data and stakeholder insights to drive strategic decisions. I aim to bridge the gap between technical teams and business stakeholders effectively. My goal is to deliver solutions that create measurable business impact.",
  "Lawyer": "I am dedicated to upholding justice and providing expert legal counsel to those in need. I believe in the power of law to create positive change and protect individual rights. I aim to combine thorough legal research with persuasive advocacy. My commitment is to serve my clients with integrity and professional excellence.",
  "Journalist": "I am passionate about uncovering truth and telling stories that matter to communities. I believe in the vital role of independent journalism in maintaining democratic accountability. I aim to combine investigative rigor with compelling storytelling across all media platforms. My mission is to inform, educate, and empower the public through quality reporting.",
};

const FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "actually", "literally", "so", "well", "right"];

type Step = "select_role" | "read_paragraph" | "recording" | "analyzing" | "result";

interface AnalysisResult {
  confidence_score: number;
  fluency_score: number;
  clarity_score: number;
  speaking_speed: string;
  filler_word_density: string;
  energy_level: string;
  wpm: number;
  strengths: string[];
  improvements: string[];
  readiness_level: string;
}

const VoiceConfidencePage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("select_role");
  const [selectedRole, setSelectedRole] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeadphoneAlert, setShowHeadphoneAlert] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const roles = Object.keys(ROLE_PARAGRAPHS);

  const handleStartRecording = () => {
    setShowHeadphoneAlert(true);
  };

  const confirmStartRecording = () => {
    setShowHeadphoneAlert(false);
    startRecording();
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript("");
      setStep("recording");

      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);

      // Web Speech API for transcript
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN";
        let finalTranscript = "";
        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
            else interim += event.results[i][0].transcript;
          }
          setTranscript(finalTranscript + interim);
        };
        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      } else {
        toast.error("Speech recognition not supported in this browser. Try Chrome.");
      }
    } catch {
      toast.error("Microphone access denied. Please allow microphone permission.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  }, []);

  const analyzeVoice = async () => {
    if (!transcript.trim()) {
      toast.error("No speech detected. Please try recording again.");
      return;
    }
    setStep("analyzing");
    setIsAnalyzing(true);

    const wordCount = transcript.trim().split(/\s+/).length;
    const wpm = recordingTime > 0 ? Math.round(wordCount / (recordingTime / 60)) : 0;
    const fillerCount = FILLER_WORDS.reduce((acc, w) => {
      const regex = new RegExp(`\\b${w}\\b`, "gi");
      return acc + (transcript.match(regex) || []).length;
    }, 0);

    try {
      const { data, error } = await supabase.functions.invoke("career-insights", {
        body: {
          action: "voice_analysis",
          role: selectedRole,
          transcript: transcript.trim(),
          wpm,
          duration: recordingTime,
          wordCount,
          fillerCount,
        },
      });
      if (error) throw error;
      if (!data || typeof data.confidence_score === 'undefined') {
        throw new Error("Invalid analysis response");
      }
      setResult(data);
      setStep("result");
    } catch (e: any) {
      toast.error(e.message || "Voice analysis could not complete. Please try recording again.");
      setStep("recording");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.src = audioUrl; audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const resetAll = () => {
    setStep("select_role");
    setSelectedRole("");
    setTranscript("");
    setAudioUrl(null);
    setResult(null);
    setRecordingTime(0);
    setShowHeadphoneAlert(false);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const ScoreCircle = ({ score, label, color }: { score: number; label: string; color: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6"
            className={color} strokeDasharray={`${score * 2.64} ${264 - score * 2.64}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
        </div>
      </div>
      <span className="text-xs mt-2 text-muted-foreground font-medium">{label}</span>
    </div>
  );

  const radarData = result ? [
    { subject: "Confidence", value: result.confidence_score },
    { subject: "Fluency", value: result.fluency_score },
    { subject: "Clarity", value: result.clarity_score },
    { subject: "Energy", value: result.energy_level === "High" ? 90 : result.energy_level === "Moderate" ? 60 : 30 },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navigation />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-foreground">AI Voice Confidence</span>
          </div>
          {step !== "select_role" && (
            <Button variant="ghost" size="sm" onClick={resetAll} title="Start Fresh Analysis">
              <RefreshCw className="mr-2 h-4 w-4" />Reset
            </Button>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">🎤 AI Voice Confidence Analyzer</h1>
          <p className="text-muted-foreground">Record your speech, get AI-powered confidence & fluency analysis</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Select Role", "Read Paragraph", "Record", "Result"].map((label, i) => {
            const stepMap: Step[] = ["select_role", "read_paragraph", "recording", "result"];
            const currentIdx = stepMap.indexOf(step === "analyzing" ? "result" : step);
            const isActive = i <= currentIdx;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                <span className={`text-xs hidden sm:block ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                {i < 3 && <div className={`flex-1 h-0.5 ${isActive ? "bg-primary" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Select Role */}
        {step === "select_role" && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-purple-600" />Select Interview Role</CardTitle>
              <CardDescription>Choose the role you want to practice for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                {roles.map(role => (
                  <button key={role} onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${selectedRole === role ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"}`}>
                    {role}
                  </button>
                ))}
              </div>
              <Button onClick={() => { if (!selectedRole) { toast.error("Select a role first"); return; } setStep("read_paragraph"); }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={!selectedRole}>
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Read Paragraph */}
        {step === "read_paragraph" && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Volume2 className="h-5 w-5 text-blue-600" />Read This Paragraph</CardTitle>
              <CardDescription>Please read the following paragraph clearly and confidently when recording starts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-2 border-blue-500/20 mb-6">
                <p className="text-lg leading-relaxed font-medium">
                  "{ROLE_PARAGRAPHS[selectedRole] || ROLE_PARAGRAPHS["Software Engineer"]}"
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">💡 Tip: Speak naturally, maintain a steady pace, and avoid filler words like "um" or "uh".</p>
              
              {/* Headphone Alert */}
              {showHeadphoneAlert && (
                <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 mb-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <Headphones className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">⚠️ Headphones recommended for best audio quality.</p>
                      <p className="text-xs text-muted-foreground mt-1">Speak clearly and avoid background noise for accurate results.</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={confirmStartRecording} className="bg-gradient-to-r from-red-500 to-pink-500">
                          <Mic className="mr-2 h-4 w-4" />Start Recording
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowHeadphoneAlert(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!showHeadphoneAlert && (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("select_role")}><ArrowLeft className="mr-2 h-4 w-4" />Change Role</Button>
                  <Button onClick={handleStartRecording} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                    <Mic className="mr-2 h-4 w-4" />Start Recording
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Recording */}
        {step === "recording" && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isRecording ? <Mic className="h-5 w-5 text-red-500 animate-pulse" /> : <MicOff className="h-5 w-5 text-muted-foreground" />}
                {isRecording ? "Recording..." : "Recording Complete"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show paragraph reference during recording */}
              <div className="p-3 rounded-lg bg-muted/30 border border-dashed mb-4 text-xs text-muted-foreground max-h-20 overflow-y-auto">
                <p className="font-medium text-foreground mb-1">📜 Reference:</p>
                {ROLE_PARAGRAPHS[selectedRole]}
              </div>

              {isRecording && (
                <div className="flex flex-col items-center py-8">
                  {/* Audio wave animation */}
                  <div className="flex items-center gap-1 mb-6 h-16">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="w-1.5 bg-red-500 rounded-full animate-pulse" style={{
                        height: `${Math.random() * 48 + 16}px`,
                        animationDelay: `${i * 0.05}s`,
                        animationDuration: `${0.4 + Math.random() * 0.4}s`
                      }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-2xl font-mono font-bold text-red-500 mb-2">
                    <Clock className="h-5 w-5" />{formatTime(recordingTime)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Speak clearly into your microphone</p>
                  <Button onClick={stopRecording} variant="destructive" size="lg">
                    <MicOff className="mr-2 h-5 w-5" />Stop Recording
                  </Button>
                </div>
              )}

              {!isRecording && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Duration: {formatTime(recordingTime)}</span>
                    <span>Words: {transcript.trim().split(/\s+/).filter(Boolean).length}</span>
                  </div>
                  
                  {/* Audio Playback */}
                  {audioUrl && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                      <Button variant="outline" size="sm" onClick={togglePlayback}>
                        {isPlaying ? <><Pause className="mr-2 h-4 w-4" />Pause</> : <><Play className="mr-2 h-4 w-4" />▶ Listen to Your Recording</>}
                      </Button>
                      <span className="text-xs text-muted-foreground">Review before analyzing</span>
                    </div>
                  )}

                  {transcript.trim() ? (
                    <div className="p-4 rounded-lg bg-muted/50 border max-h-40 overflow-y-auto">
                      <p className="text-sm font-medium mb-1">Transcript:</p>
                      <p className="text-sm text-muted-foreground">{transcript}</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        No speech detected. Please try recording again with clear audio.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { setTranscript(""); setAudioUrl(null); handleStartRecording(); setStep("read_paragraph"); }}>
                      <RefreshCw className="mr-2 h-4 w-4" />Re-record
                    </Button>
                    <Button onClick={analyzeVoice} className="bg-gradient-to-r from-blue-600 to-purple-600" disabled={!transcript.trim()}>
                      <BarChart3 className="mr-2 h-4 w-4" />Analyze Speech
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analyzing */}
        {step === "analyzing" && (
          <Card className="animate-fade-in">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Analyzing your voice confidence...</h3>
              <p className="text-muted-foreground text-sm">Evaluating confidence, fluency, clarity & more</p>
              <div className="w-full mt-6 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {step === "result" && result && (
          <div className="space-y-6 animate-fade-in">
            {/* Readiness Badge */}
            <div className="text-center">
              <Badge className={`text-lg px-6 py-2 ${
                result.readiness_level === "Professional" ? "bg-green-500" :
                result.readiness_level === "Job Ready" ? "bg-blue-500" :
                result.readiness_level === "Developing" ? "bg-amber-500" : "bg-red-500"
              }`}>
                🎯 Interview Readiness: {result.readiness_level}
              </Badge>
            </div>

            {/* Score Circles */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap justify-center gap-8">
                  <ScoreCircle score={result.confidence_score} label="Confidence" color="text-blue-500" />
                  <ScoreCircle score={result.fluency_score} label="Fluency" color="text-green-500" />
                  <ScoreCircle score={result.clarity_score} label="Clarity" color="text-purple-500" />
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader><CardTitle className="text-base">📊 Performance Radar</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                      <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{result.wpm}</p>
                  <p className="text-xs text-muted-foreground">Words/Min</p>
                  <Badge variant="outline" className="mt-1">{result.speaking_speed}</Badge>
                  <div className="mt-2">
                    <Progress value={Math.min(result.wpm / 1.6, 100)} className="h-1" />
                    <p className="text-[10px] text-muted-foreground mt-1">Ideal: 130–160 WPM</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{result.filler_word_density}</p>
                  <p className="text-xs text-muted-foreground">Filler Words</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{result.energy_level}</p>
                  <p className="text-xs text-muted-foreground">Energy Level</p>
                </CardContent>
              </Card>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-500/20">
                <CardHeader><CardTitle className="text-base">💪 Strengths</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">{result.strengths?.map((s, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>{s}</li>)}</ul>
                </CardContent>
              </Card>
              <Card className="border-amber-500/20">
                <CardHeader><CardTitle className="text-base">📈 Improvements</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">{result.improvements?.map((s, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-amber-500 mt-0.5">→</span>{s}</li>)}</ul>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={resetAll} variant="outline"><RefreshCw className="mr-2 h-4 w-4" />New Analysis</Button>
              {audioUrl && (
                <Button variant="outline" onClick={togglePlayback}>
                  {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  Listen to Recording
                </Button>
              )}
              <Button asChild className="bg-gradient-to-r from-indigo-600 to-blue-600">
                <Link to="/mock-interview"><Mic className="mr-2 h-4 w-4" />Start Mock Interview</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VoiceConfidencePage;
