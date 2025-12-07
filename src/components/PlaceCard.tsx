import { MapPin } from 'lucide-react';
import type { Place } from '@/pages/Places';

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

        {/* Map Icon Link */}
        {place.Links && (
          <div className="mt-auto">
            <a
              href={place.Links}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin className="h-4 w-4 mr-2" />
              View Location
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
