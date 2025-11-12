import { ThumbsUp, ThumbsDown, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecommendationFeedback } from '@/hooks/useRecommendationFeedback';
import { cn } from '@/lib/utils';

interface FeedbackButtonsProps {
  recommendationType: 'job' | 'college' | 'scholarship';
  recommendationId: string;
  showApplied?: boolean;
  className?: string;
}

export const FeedbackButtons = ({ 
  recommendationType, 
  recommendationId, 
  showApplied = false,
  className 
}: FeedbackButtonsProps) => {
  const { submitFeedback, getFeedback, loading } = useRecommendationFeedback();
  const currentFeedback = getFeedback(recommendationType, recommendationId);

  const handleFeedback = async (type: 'like' | 'dislike' | 'applied' | 'not_interested') => {
    await submitFeedback(recommendationType, recommendationId, type);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        size="sm"
        variant={currentFeedback === 'like' ? 'default' : 'outline'}
        onClick={() => handleFeedback('like')}
        disabled={loading}
        className="gap-1"
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Helpful</span>
      </Button>
      
      <Button
        size="sm"
        variant={currentFeedback === 'dislike' ? 'destructive' : 'outline'}
        onClick={() => handleFeedback('dislike')}
        disabled={loading}
        className="gap-1"
      >
        <ThumbsDown className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Not Helpful</span>
      </Button>

      {showApplied && (
        <>
          <Button
            size="sm"
            variant={currentFeedback === 'applied' ? 'default' : 'outline'}
            onClick={() => handleFeedback('applied')}
            disabled={loading}
            className="gap-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Applied</span>
          </Button>
          
          <Button
            size="sm"
            variant={currentFeedback === 'not_interested' ? 'destructive' : 'outline'}
            onClick={() => handleFeedback('not_interested')}
            disabled={loading}
            className="gap-1"
          >
            <XCircle className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Not Interested</span>
          </Button>
        </>
      )}
    </div>
  );
};
