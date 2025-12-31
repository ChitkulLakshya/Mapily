import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MapsButtonProps {
  lat: string | number;
  lng: string | number;
  className?: string;
  variant?: 'icon' | 'button';
}

const MapsButton = ({ lat, lng, className, variant = 'button' }: MapsButtonProps) => {
  const handleMapsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent card click
    
    // Construct Google Maps Directions URL
    // api=1 ensures it uses the cross-platform URL scheme
    // destination=lat,lng sets the target
    // dir_action=navigate (optional) can start navigation immediately
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleMapsClick}
        className={cn(
          "p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
          className
        )}
        aria-label="Get Directions"
        title="Get Directions"
      >
        <Navigation className="w-5 h-5" />
      </button>
    );
  }

  return (
    <Button
      onClick={handleMapsClick}
      className={cn("gap-2", className)}
      variant="outline"
      size="sm"
    >
      <Navigation className="w-4 h-4" />
      Get Directions
    </Button>
  );
};

export default MapsButton;
