import { Star, MapPin, Map } from 'lucide-react';
import type { Place } from '@/pages/Places';

interface PlaceCardProps {
  place: Place;
}

const PlaceCard = ({ place }: PlaceCardProps) => {
  // Fallback Maps URL if not provided
  const mapsLink = place.mapsURL || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`;

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-smooth cursor-pointer">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={place.imageURL}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-foreground">{place.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            {place.category}
          </span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-smooth">
          {place.name}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {place.description}
        </p>
        <div className="flex items-start space-x-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{place.address}</span>
        </div>

        {/* Google Maps Link */}
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
        >
          <Map className="h-4 w-4 mr-2" />
          View on Google Maps
        </a>
      </div>
    </div>
  );
};

export default PlaceCard;
