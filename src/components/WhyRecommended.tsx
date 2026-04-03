import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  HelpCircle, 
  Check, 
  MapPin, 
  GraduationCap, 
  DollarSign, 
  Target, 
  Brain, 
  Star,
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhyRecommendedProps {
  explanations: string[];
  confidenceBand?: 'High' | 'Medium' | 'Low';
  confidenceScore?: number;
  variant?: 'badge' | 'icon' | 'button';
  className?: string;
}

const getExplanationIcon = (text: string) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('location') || lowerText.includes('district') || lowerText.includes('state') || lowerText.includes('nearby')) {
    return <MapPin className="h-3.5 w-3.5 text-blue-500" />;
  }
  if (lowerText.includes('education') || lowerText.includes('level') || lowerText.includes('course') || lowerText.includes('academic')) {
    return <GraduationCap className="h-3.5 w-3.5 text-purple-500" />;
  }
  if (lowerText.includes('cost') || lowerText.includes('fee') || lowerText.includes('affordable') || lowerText.includes('scholarship')) {
    return <DollarSign className="h-3.5 w-3.5 text-green-500" />;
  }
  if (lowerText.includes('aptitude') || lowerText.includes('strength') || lowerText.includes('skill')) {
    return <Brain className="h-3.5 w-3.5 text-orange-500" />;
  }
  if (lowerText.includes('interest') || lowerText.includes('goal') || lowerText.includes('career')) {
    return <Target className="h-3.5 w-3.5 text-pink-500" />;
  }
  if (lowerText.includes('rating') || lowerText.includes('quality') || lowerText.includes('accredit')) {
    return <Star className="h-3.5 w-3.5 text-yellow-500" />;
  }
  return <Check className="h-3.5 w-3.5 text-primary" />;
};

const getConfidenceBadgeStyle = (band?: 'High' | 'Medium' | 'Low') => {
  switch (band) {
    case 'High':
      return 'bg-green-500/20 text-green-700 border-green-500/30';
    case 'Medium':
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    case 'Low':
      return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const WhyRecommended = ({ 
  explanations, 
  confidenceBand, 
  confidenceScore,
  variant = 'badge',
  className 
}: WhyRecommendedProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!explanations || explanations.length === 0) {
    return null;
  }

  const content = (
    <div className="space-y-2">
      {confidenceBand && (
        <div className="flex items-center gap-2 mb-3">
          <Badge className={cn("text-xs", getConfidenceBadgeStyle(confidenceBand))}>
            {confidenceBand} Confidence
          </Badge>
          {confidenceScore !== undefined && (
            <span className="text-sm font-medium">{confidenceScore}% Match</span>
          )}
        </div>
      )}
      <div className="space-y-1.5">
        {explanations.map((explanation, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            {getExplanationIcon(explanation)}
            <span className="text-muted-foreground">{explanation}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button className={cn("p-1 rounded-full hover:bg-muted transition-colors", className)}>
              <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs p-3">
            <p className="font-medium mb-2 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              Why Recommended?
            </p>
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'button') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("gap-1 text-xs", className)}>
            <Sparkles className="h-3 w-3" />
            Why this?
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Why We Recommended This
            </DialogTitle>
            <DialogDescription>
              Based on your profile and preferences
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default: badge variant with popover
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "cursor-help gap-1 text-xs transition-colors hover:bg-primary/10",
              className
            )}
          >
            <Sparkles className="h-3 w-3" />
            Why?
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <p className="font-medium mb-2">Why Recommended?</p>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WhyRecommended;
