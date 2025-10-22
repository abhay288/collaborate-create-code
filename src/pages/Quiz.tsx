import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Save, Clock } from "lucide-react";
import { toast } from "sonner";

// Sample quiz questions - will be replaced with real data
const quizQuestions = [
  {
    id: 1,
    category: "Logical Reasoning",
    question: "If all roses are flowers and some flowers fade quickly, which statement must be true?",
    options: [
      "All roses fade quickly",
      "Some roses may fade quickly",
      "No roses fade quickly",
      "All flowers are roses"
    ]
  },
  {
    id: 2,
    category: "Analytical Skills",
    question: "A train travels 120 km in 2 hours. At the same speed, how long will it take to travel 300 km?",
    options: [
      "4 hours",
      "5 hours",
      "6 hours",
      "7 hours"
    ]
  },
  {
    id: 3,
    category: "Creativity",
    question: "How would you use a brick in five different ways?",
    options: [
      "I can think of 1-2 ways",
      "I can think of 3-4 ways",
      "I can think of 5-7 ways",
      "I can think of 8+ ways"
    ]
  },
  {
    id: 4,
    category: "Technical Interest",
    question: "Which activity sounds most interesting to you?",
    options: [
      "Building and fixing things",
      "Analyzing data and patterns",
      "Creating art or content",
      "Helping and teaching others"
    ]
  },
  {
    id: 5,
    category: "Problem Solving",
    question: "When faced with a complex problem, you prefer to:",
    options: [
      "Break it into smaller parts",
      "Look for similar solved problems",
      "Brainstorm creative solutions",
      "Consult with experts"
    ]
  },
  {
    id: 6,
    category: "Logical Reasoning",
    question: "What comes next in the sequence: 2, 6, 12, 20, 30, ?",
    options: [
      "40",
      "42",
      "44",
      "46"
    ]
  },
  {
    id: 7,
    category: "Analytical Skills",
    question: "You have data showing sales decreased. Your first step is to:",
    options: [
      "Immediately propose solutions",
      "Analyze trends and patterns",
      "Compare with competitors",
      "Survey customers"
    ]
  },
  {
    id: 8,
    category: "Creativity",
    question: "When working on a project, you prefer to:",
    options: [
      "Follow proven methods",
      "Mix traditional and new approaches",
      "Experiment with novel ideas",
      "Collaborate and innovate together"
    ]
  },
  {
    id: 9,
    category: "Technical Interest",
    question: "Learning new software/technology is:",
    options: [
      "Very exciting",
      "Somewhat interesting",
      "Okay if necessary",
      "Not my preference"
    ]
  },
  {
    id: 10,
    category: "Problem Solving",
    question: "A project has an unexpected obstacle. You:",
    options: [
      "Quickly pivot to plan B",
      "Analyze why it happened",
      "Think outside the box",
      "Get team input"
    ]
  },
  {
    id: 11,
    category: "Logical Reasoning",
    question: "If some cats are mammals and all mammals are animals, then:",
    options: [
      "All animals are cats",
      "Some cats are animals",
      "All cats are animals",
      "No cats are animals"
    ]
  },
  {
    id: 12,
    category: "Analytical Skills",
    question: "You're most comfortable with:",
    options: [
      "Numbers and statistics",
      "Written analysis",
      "Visual data representation",
      "Verbal discussion"
    ]
  },
  {
    id: 13,
    category: "Creativity",
    question: "In your free time, you enjoy:",
    options: [
      "Structured activities",
      "A mix of planned and spontaneous",
      "Creative hobbies",
      "Social activities"
    ]
  },
  {
    id: 14,
    category: "Technical Interest",
    question: "Understanding how things work internally is:",
    options: [
      "Fascinating",
      "Interesting",
      "Not important",
      "Overwhelming"
    ]
  },
  {
    id: 15,
    category: "Problem Solving",
    question: "Your problem-solving strength is:",
    options: [
      "Systematic approach",
      "Research and analysis",
      "Creative thinking",
      "Collaboration"
    ]
  },
  {
    id: 16,
    category: "Logical Reasoning",
    question: "Which shape completes the pattern: Circle, Square, Triangle, Circle, Square, ?",
    options: [
      "Circle",
      "Square",
      "Triangle",
      "Rectangle"
    ]
  },
  {
    id: 17,
    category: "Analytical Skills",
    question: "When reading an article, you focus on:",
    options: [
      "Main arguments",
      "Data and evidence",
      "Writing style",
      "Practical applications"
    ]
  },
  {
    id: 18,
    category: "Creativity",
    question: "You approach brainstorming by:",
    options: [
      "Building on existing ideas",
      "Analyzing constraints first",
      "Free-flowing ideation",
      "Group collaboration"
    ]
  },
  {
    id: 19,
    category: "Technical Interest",
    question: "Working with computers and technology:",
    options: [
      "Is my passion",
      "Is useful and interesting",
      "Is just a tool",
      "Is challenging for me"
    ]
  },
  {
    id: 20,
    category: "Problem Solving",
    question: "After solving a problem, you:",
    options: [
      "Document the solution",
      "Analyze what worked",
      "Move to the next challenge",
      "Share with others"
    ]
  }
];

export default function Quiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  // Timer
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('quiz-progress', JSON.stringify({
      currentQuestion,
      answers,
      timeElapsed,
      timestamp: Date.now()
    }));
  }, [currentQuestion, answers, timeElapsed]);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('quiz-progress');
    if (saved) {
      const { currentQuestion: savedQ, answers: savedA, timeElapsed: savedT } = JSON.parse(saved);
      setCurrentQuestion(savedQ);
      setAnswers(savedA);
      setTimeElapsed(savedT);
    }
  }, []);

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({ ...answers, [quizQuestions[currentQuestion].id]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const unanswered = quizQuestions.filter(q => !(q.id in answers));
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`);
      return;
    }

    // Save results and navigate
    localStorage.setItem('quiz-results', JSON.stringify({
      answers,
      timeElapsed,
      completedAt: Date.now()
    }));
    localStorage.removeItem('quiz-progress');
    navigate('/quiz/results');
  };

  const handleSaveAndExit = () => {
    toast.success("Progress saved! You can resume anytime.");
    navigate('/dashboard');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestionData = quizQuestions[currentQuestion];
  const selectedAnswer = answers[currentQuestionData.id];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Aptitude Assessment</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save & Exit
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Save your progress?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your answers will be saved and you can continue later from where you left off.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSaveAndExit}>Save & Exit</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {currentQuestionData.category}
              </span>
              <span className="text-sm text-muted-foreground">
                {Object.keys(answers).length}/{quizQuestions.length} answered
              </span>
            </div>
            <CardTitle className="text-xl">{currentQuestionData.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              <div className="space-y-3">
                {currentQuestionData.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={selectedAnswer === undefined}
            >
              {currentQuestion === quizQuestions.length - 1 ? 'Submit' : 'Next'}
              {currentQuestion < quizQuestions.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </CardFooter>
        </Card>

        {/* Question Navigator */}
        <Card>
          <CardHeader>
            <CardDescription>Quick Navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {quizQuestions.map((q, index) => (
                <Button
                  key={q.id}
                  variant={index === currentQuestion ? "default" : (q.id in answers) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuestion(index)}
                  className="w-full"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
