import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Save, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuizSession } from "@/hooks/useQuizSession";
import { useCareerRecommendations } from "@/hooks/useCareerRecommendations";
import { supabase } from "@/integrations/supabase/client";

interface QuizQuestion {
  id: string;
  question_text: string;
  category: string;
  options: any;
}

export default function Quiz() {
  const navigate = useNavigate();
  const { startNewSession, saveResponse, completeSession, currentSession } = useQuizSession();
  const { generateRecommendations } = useCareerRecommendations();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [savedResponses, setSavedResponses] = useState<Array<{
    question_id: string;
    category: string;
    selected_option: string;
    points_earned: number;
  }>>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const progress = quizQuestions.length > 0 ? ((currentQuestion + 1) / quizQuestions.length) * 100 : 0;

  // Timer
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Shuffle array utility function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load quiz questions from database based on user profile
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Get user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please log in to take the quiz');
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('class_level, study_area')
          .eq('id', user.id)
          .maybeSingle();

        // Use default values if profile not set
        const classLevel = profile?.class_level || '12th';
        const studyArea = profile?.study_area || 'All';

        // Fetch filtered questions using the database function
        const { data, error } = await supabase
          .rpc('get_filtered_quiz_questions', {
            p_class_level: classLevel,
            p_study_area: studyArea,
            p_limit: 20
          });

        if (error) throw error;

        // If no questions found, generate new ones using AI
        if (!data || data.length === 0) {
          toast.info('Generating personalized questions for you...');
          
          const { data: generatedData, error: genError } = await supabase.functions.invoke(
            'generate-quiz-questions',
            {
              body: { classLevel, studyArea }
            }
          );

          if (genError) {
            console.error('Error generating questions:', genError);
            toast.error('Failed to generate quiz questions');
            navigate('/dashboard');
            return;
          }

          if (generatedData?.questions && generatedData.questions.length > 0) {
            // Shuffle questions and their options
            const shuffledQuestions = shuffleArray(generatedData.questions).map((q: any) => ({
              ...q,
              options: shuffleArray(Array.isArray(q.options) ? q.options : q.options?.options || [])
            }));
            setQuizQuestions(shuffledQuestions);
            toast.success('Personalized quiz ready!');
          } else {
            toast.error('No questions generated. Please try again.');
            navigate('/dashboard');
          }
        } else {
          // Shuffle questions and their options
          const shuffledQuestions = shuffleArray(data).map((q: any) => ({
            ...q,
            options: shuffleArray(Array.isArray(q.options) ? q.options : q.options?.options || [])
          }));
          setQuizQuestions(shuffledQuestions);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        toast.error('Failed to load quiz questions');
        navigate('/dashboard');
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [navigate]);

  // Initialize quiz session
  useEffect(() => {
    if (quizQuestions.length === 0) return;

    const initSession = async () => {
      const session = await startNewSession();
      if (session) {
        setSessionId(session.id);
      } else {
        toast.error('Failed to start quiz. Please try again.');
        navigate('/dashboard');
      }
    };
    
    initSession();
  }, [quizQuestions]);

  const handleAnswerSelect = async (optionIndex: number) => {
    if (!sessionId) {
      toast.error('Quiz session not initialized. Please refresh and try again.');
      return;
    }

    // Validation: Ensure option is valid
    if (optionIndex < 0) {
      toast.error('Please select a valid answer option.');
      return;
    }

    const question = quizQuestions[currentQuestion];
    const options = Array.isArray(question.options) ? question.options : question.options?.options || [];
    
    // Validation: Check if option exists
    if (optionIndex >= options.length) {
      toast.error('Invalid answer option selected.');
      return;
    }

    const newAnswers = { ...answers, [question.id]: optionIndex };
    setAnswers(newAnswers);

    // Save response to server immediately
    try {
      const selectedOptionText = typeof options[optionIndex] === 'string' 
        ? options[optionIndex] 
        : options[optionIndex]?.text || `Option ${optionIndex + 1}`;

      // Calculate points earned (1-5 scale based on option or default to 1)
      const pointsEarned = typeof options[optionIndex] === 'object' 
        ? options[optionIndex]?.points || 1
        : 1;
      
      const saved = await saveResponse(
        sessionId,
        question.id,
        selectedOptionText,
        pointsEarned
      );

      if (!saved) {
        throw new Error('Failed to save response');
      }

      const existingIndex = savedResponses.findIndex(r => r.question_id === question.id);
      if (existingIndex >= 0) {
        const updated = [...savedResponses];
        updated[existingIndex] = {
          question_id: question.id,
          category: question.category,
          selected_option: selectedOptionText,
          points_earned: pointsEarned
        };
        setSavedResponses(updated);
      } else {
        setSavedResponses([...savedResponses, {
          question_id: question.id,
          category: question.category,
          selected_option: selectedOptionText,
          points_earned: pointsEarned
        }]);
      }
      toast.success('Answer saved ✓', { duration: 1000 });
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error('Failed to save answer. Please try again.');
      // Revert the local answer state on error
      const revertedAnswers = { ...answers };
      delete revertedAnswers[question.id];
      setAnswers(revertedAnswers);
    }
  };

  const handleNext = () => {
    // Validation: Ensure current question is answered before proceeding
    const currentQuestionId = quizQuestions[currentQuestion]?.id;
    if (!currentQuestionId || !(currentQuestionId in answers)) {
      toast.error('Please answer the current question before proceeding.', { duration: 2000 });
      return;
    }

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

  const handleSubmit = async () => {
    // Validation: Check all questions are answered
    const unanswered = quizQuestions.filter(q => !(q.id in answers));
    if (unanswered.length > 0) {
      const unansweredNumbers = unanswered.map(q => quizQuestions.indexOf(q) + 1).join(', ');
      toast.error(`Please answer all questions. Missing: Question(s) ${unansweredNumbers}`, { duration: 4000 });
      
      // Jump to first unanswered question
      const firstUnanswered = quizQuestions.findIndex(q => !(q.id in answers));
      if (firstUnanswered >= 0) {
        setCurrentQuestion(firstUnanswered);
      }
      return;
    }

    // Validation: Ensure session exists
    if (!sessionId) {
      toast.error('Quiz session error. Please refresh and try again.');
      return;
    }

    // Validation: Ensure responses are saved
    if (savedResponses.length === 0) {
      toast.error('No answers saved. Please answer the questions and try again.');
      return;
    }

    // Validation: Ensure all answered questions have saved responses
    if (savedResponses.length !== quizQuestions.length) {
      toast.error(`Only ${savedResponses.length} of ${quizQuestions.length} answers were saved. Please review your answers.`);
      return;
    }

    try {
      // Calculate total score and category scores
      const totalPoints = savedResponses.reduce((sum, r) => sum + r.points_earned, 0);
      const maxPoints = savedResponses.length * 5; // Assuming max 5 points per question
      const score = Math.round((totalPoints / maxPoints) * 100);

      // Calculate category-wise scores
      const categoryScores: Record<string, { total: number; max: number }> = {};
      savedResponses.forEach(response => {
        if (!categoryScores[response.category]) {
          categoryScores[response.category] = { total: 0, max: 0 };
        }
        categoryScores[response.category].total += response.points_earned;
        categoryScores[response.category].max += 5;
      });

      // Complete the session with category scores
      await completeSession(sessionId, score);
      
      // Update session with category scores
      await supabase
        .from('quiz_sessions')
        .update({ category_scores: categoryScores })
        .eq('id', sessionId);

      // Generate AI recommendations
      await generateRecommendations(sessionId, savedResponses);

      toast.success('Quiz submitted successfully!');

      // Navigate to results with session ID
      navigate(`/quiz/results?session=${sessionId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    }
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

  if (loadingQuestions || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-glow rounded-full" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground text-lg">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestionData = quizQuestions[currentQuestion];
  const selectedAnswer = answers[currentQuestionData?.id];
  const options = Array.isArray(currentQuestionData?.options) 
    ? currentQuestionData.options 
    : currentQuestionData?.options?.options || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Aptitude Assessment
            </h1>
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
              <span className="font-bold text-primary">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent [&>div]:animate-pulse" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 rounded-full border border-primary/20 animate-pulse-glow">
                {currentQuestionData.category}
              </span>
              <span className="text-sm text-muted-foreground">
                {Object.keys(answers).length}/{quizQuestions.length} answered
              </span>
            </div>
            <CardTitle className="text-xl">{currentQuestionData.question_text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              <div className="space-y-3">
                {options.map((option: any, index: number) => {
                  const optionText = typeof option === 'string' ? option : option?.text || `Option ${index + 1}`;
                  const isSelected = selectedAnswer === index;
                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 border-2 rounded-lg p-4 transition-all duration-300 cursor-pointer
                        ${isSelected 
                          ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary shadow-lg scale-105' 
                          : 'border-muted hover:border-primary/50 hover:bg-accent/20 hover:scale-102'
                        }`}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {optionText}
                      </Label>
                    </div>
                  );
                })}
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
              className={selectedAnswer === undefined ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {currentQuestion === quizQuestions.length - 1 ? 'Submit Quiz' : 'Next Question'}
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
