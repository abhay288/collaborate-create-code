import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface FullScreenState {
  isFullScreen: boolean;
  isSupported: boolean;
  warningCount: number;
  isTerminated: boolean;
  terminationReason: string | null;
}

export const useFullScreenQuiz = () => {
  const [state, setState] = useState<FullScreenState>({
    isFullScreen: false,
    isSupported: typeof document !== 'undefined' && !!document.documentElement.requestFullscreen,
    warningCount: 0,
    isTerminated: false,
    terminationReason: null,
  });

  const quizActiveRef = useRef(false);
  const intentionalExitRef = useRef(false);

  // ESC Key Handler - STRICTLY TERMINATE QUIZ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && quizActiveRef.current && !state.isTerminated) {
        e.preventDefault();
        e.stopPropagation();
        
        // Immediately terminate the quiz - NO SECOND CHANCES
        setState(prev => ({
          ...prev,
          isTerminated: true,
          terminationReason: 'Quiz terminated: ESC key pressed. This attempt is now invalid.',
        }));
        
        toast.error('Quiz Terminated', {
          description: 'You pressed ESC. This quiz attempt is now invalid and cannot be resumed.',
          duration: 10000,
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [state.isTerminated]);

  const enterFullScreen = useCallback(async () => {
    if (!state.isSupported) {
      toast.warning('Full-screen mode not supported in your browser. Please avoid switching tabs.');
      quizActiveRef.current = true;
      return true;
    }

    try {
      await document.documentElement.requestFullscreen();
      quizActiveRef.current = true;
      intentionalExitRef.current = false;
      setState(prev => ({ ...prev, isFullScreen: true }));
      return true;
    } catch (error) {
      console.error('Failed to enter full-screen:', error);
      toast.warning('Could not enter full-screen mode. Please avoid switching tabs during the quiz.');
      quizActiveRef.current = true;
      return true;
    }
  }, [state.isSupported]);

  const exitFullScreen = useCallback(async () => {
    quizActiveRef.current = false;
    intentionalExitRef.current = true;
    
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error('Failed to exit full-screen:', error);
      }
    }
    setState(prev => ({ ...prev, isFullScreen: false }));
  }, []);

  const resetTermination = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTerminated: false,
      terminationReason: null,
      warningCount: 0,
    }));
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isNowFullScreen = !!document.fullscreenElement;
      
      setState(prev => {
        // User exited full-screen during quiz (not via our intentional exit)
        if (prev.isFullScreen && !isNowFullScreen && quizActiveRef.current && !intentionalExitRef.current && !prev.isTerminated) {
          const newWarningCount = prev.warningCount + 1;
          
          if (newWarningCount >= 2) {
            toast.error('Quiz Terminated', {
              description: 'Exiting full-screen mode multiple times is not allowed.',
              duration: 10000,
            });
            return { 
              ...prev, 
              isFullScreen: false, 
              warningCount: newWarningCount,
              isTerminated: true,
              terminationReason: 'Quiz terminated: Exited full-screen mode multiple times.'
            };
          }
          
          toast.warning(
            `Warning ${newWarningCount}/2: Please stay in full-screen mode during the quiz!`,
            { duration: 5000 }
          );
          
          return { ...prev, isFullScreen: false, warningCount: newWarningCount };
        }
        
        return { ...prev, isFullScreen: isNowFullScreen };
      });
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Listen for visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && quizActiveRef.current && !state.isTerminated) {
        setState(prev => {
          const newWarningCount = prev.warningCount + 1;
          
          if (newWarningCount >= 3) {
            toast.error('Quiz Terminated', {
              description: 'Too many tab switches detected. This quiz attempt is now invalid.',
              duration: 10000,
            });
            return { 
              ...prev, 
              warningCount: newWarningCount,
              isTerminated: true,
              terminationReason: 'Quiz terminated: Too many tab switches detected.'
            };
          }
          
          toast.warning(
            `Warning ${newWarningCount}/3: Tab switching detected! ${3 - newWarningCount} warning(s) remaining.`,
            { duration: 5000 }
          );
          
          return { ...prev, warningCount: newWarningCount };
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isTerminated]);

  // Prevent back navigation during quiz
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (quizActiveRef.current && !state.isTerminated) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
        toast.warning('Please complete and submit the quiz before leaving.', { duration: 3000 });
      }
    };

    // Push initial state
    if (quizActiveRef.current) {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [state.isTerminated]);

  // Warn before page refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizActiveRef.current && !state.isTerminated) {
        e.preventDefault();
        e.returnValue = 'You have an ongoing quiz. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isTerminated]);

  return {
    ...state,
    enterFullScreen,
    exitFullScreen,
    resetTermination,
  };
};
