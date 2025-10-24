import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

interface CareerRecommendationCardProps {
  career: {
    id: string;
    title: string;
    description: string;
    requirements?: string;
    category?: string;
  };
  confidenceScore: number;
  onViewDetails: () => void;
}

const CareerRecommendationCard = ({ 
  career, 
  confidenceScore,
  onViewDetails 
}: CareerRecommendationCardProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite('career', career.id);

  const handleFavoriteToggle = () => {
    if (favorite) {
      removeFavorite('career', career.id);
    } else {
      addFavorite('career', career.id);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{career.title}</CardTitle>
            {career.category && (
              <CardDescription className="mt-1">
                <Badge variant="secondary">{career.category}</Badge>
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Match</div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getConfidenceColor(confidenceScore)}`}
                    style={{ width: `${confidenceScore}%` }}
                  />
                </div>
                <span className="font-semibold">{confidenceScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {career.description}
        </p>
        <div className="flex gap-2">
          <Button onClick={onViewDetails} className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleFavoriteToggle}
          >
            <Heart 
              className={`w-4 h-4 ${favorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerRecommendationCard;
