import { MapPin, Info } from 'lucide-react';
import type { Place } from '@/pages/Places';
import MapsButton from './MapsButton';
import { Button } from './ui/button';

interface PlaceCardProps {
  place: Place;
}

const PlaceCard = ({ place }: PlaceCardProps) => {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-smooth cursor-pointer h-full flex flex-col">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={place.Photo_URL || '/placeholder.svg'}
          alt={place.Name}
          className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-smooth">
          {place.Name}
        </h3>
        
        {/* Cuisines */}
        {place.Cuisines && (
          <p className="text-muted-foreground mb-2 text-sm">
            <span className="font-semibold">Cuisines:</span> {place.Cuisines}
          </p>
        )}

        {/* Cost */}
        {place.Cost && (
          <p className="text-muted-foreground mb-2 text-sm">
            <span className="font-semibold">Cost:</span> ₹{place.Cost}
          </p>
        )}

        {/* Timings */}
        {place.Timings && (
          <p className="text-muted-foreground mb-4 text-sm">
            <span className="font-semibold">Timings:</span> {place.Timings}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto pt-4 flex gap-2">
          {/* Info Button (Zomato) */}
          {place.Links && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                window.open(place.Links, '_blank', 'noopener,noreferrer');
              }}
            >
              <Info className="w-4 h-4" />
              Info
            </Button>
          )}

          {/* Directions Button */}
          {place.latitude && place.longitude ? (
            <MapsButton 
              lat={place.latitude} 
              lng={place.longitude} 
              className="flex-1"
            />
          ) : (
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                // Fallback to searching by name on Google Maps
                const query = encodeURIComponent(place.Name + (place.category ? ` ${place.category}` : ''));
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
              }}
            >
              <MapPin className="w-4 h-4" />
              Directions
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
