import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get city/state from reverse geocoding
        try {
          // Using Nominatim OpenStreetMap API (free, no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const city = data.address?.city || data.address?.town || data.address?.village;
          const state = data.address?.state;

          setLocation({
            latitude,
            longitude,
            city,
            state,
          });

          toast({
            title: "Location Detected",
            description: city ? `${city}, ${state}` : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
        } catch (err) {
          // If reverse geocoding fails, still use coordinates
          setLocation({
            latitude,
            longitude,
          });
          
          toast({
            title: "Location Detected",
            description: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
        }
        
        setLoading(false);
      },
      (err) => {
        let message = 'Unable to retrieve your location';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location permissions.';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
          case err.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        
        setError(message);
        setLoading(false);
        
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return { location, loading, error, requestLocation };
};
