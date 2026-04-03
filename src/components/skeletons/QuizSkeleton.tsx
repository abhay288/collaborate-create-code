import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const QuizSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-pulse">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>

          {/* Options */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-4 rounded-lg border">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 flex-1" />
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizSkeleton;
