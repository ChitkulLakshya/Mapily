import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center">
      {/* Background Vimeo Video */}
      <div className="absolute top-0 left-0 w-screen h-screen overflow-hidden">
        <iframe
          src="https://player.vimeo.com/video/1129096003?autoplay=1&loop=1&muted=1&background=1"
          className="absolute top-0 left-0 w-auto min-w-full h-auto min-h-full object-cover"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Background Video"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
          Discover Amazing Places
        </h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-8 animate-fade-in max-w-2xl mx-auto">
          Explore the best cafes, restaurants, and hidden gems in your city
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/places')}
          className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-2xl transition-smooth animate-fade-in group"
        >
          Explore Places
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default Home;
