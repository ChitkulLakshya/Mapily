import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const MobileView = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center mobile-background">

      {/* Background Video - covers entire mobile view */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          src="https://player.vimeo.com/video/1144243656?background=1&autoplay=1&loop=1&muted=1&controls=0"
          className="w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150"
          style={{
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
          }}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Background Video"
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Discover Amazing Places
        </h1>
        <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl mx-auto drop-shadow-md">
          Explore the best cafes, restaurants, and hidden gems in your city
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/places')}
          className="text-base px-6 py-4 bg-primary hover:bg-primary/90 text-white shadow-xl transition w-full sm:w-auto"
        >
          Explore Places
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MobileView;

