import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocationSelectorProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
  }) => void;
  maxDistanceKm?: number;
  onDistanceChange?: (distance: number) => void;
}

export const LocationSelector = ({ 
  onLocationSelect, 
  maxDistanceKm = 100,
  onDistanceChange 
}: LocationSelectorProps) => {
  const { location, loading, requestLocation } = useGeolocation();

  const handleLocationRequest = () => {
    requestLocation();
  };

  // Auto-select location once detected
  if (location && !loading) {
    onLocationSelect(location);
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Find Colleges Near You</CardTitle>
        </div>
        <CardDescription>
          Get personalized recommendations based on your location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleLocationRequest}
            disabled={loading}
            className="flex-1"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {loading ? 'Detecting...' : 'Use My Current Location'}
          </Button>
          
          {location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location.city ? `${location.city}, ${location.state}` : 'Located'}
            </Badge>
          )}
        </div>

        {location && (
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <p className="text-sm font-medium">Search Radius</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={maxDistanceKm}
                onChange={(e) => onDistanceChange?.(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-semibold w-16 text-right">
                {maxDistanceKm} km
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing colleges within {maxDistanceKm} km of your location
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>📍 We'll use your location to find the best colleges nearby</p>
          <p className="mt-1">🔒 Your location is never stored or shared</p>
        </div>
      </CardContent>
    </Card>
  );
};
