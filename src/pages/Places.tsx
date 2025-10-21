import { useState, useEffect, useRef } from "react";
import { fetchPlacesFromSheet } from "@/services/sheetService";
import PlaceCard from "@/components/PlaceCard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AOS from "aos";
import "aos/dist/aos.css";

/* ====== Types ====== */
export interface Place {
  category: string;
  name: string;
  address: string;
  rating: number;
  imageURL: string;
  description: string;
  gallery?: string[];
}

/* ====== Categories ====== */
const categories = [
  { name: "Cafes", image: "/images/cafes.jpg" },
  { name: "Restaurants", image: "/images/restaurants.jpg" },
  { name: "Food Trucks", image: "/images/foodtrucks.jpg" },
  { name: "Breakfast", image: "/images/breakfast.jpg" },
  { name: "Fast Food", image: "/images/fastfood.jpg" },
  { name: "Snacks", image: "/images/snacks.jpg" },
  { name: "Desserts", image: "/images/desserts.jpg" },
];

/* ====== Main Category Layout (tall cards) ====== */
const CATEGORY_LAYOUT = [
  { key: "Cafes", colSpan: 3, rowSpan: 2, h: "480px" },
  { key: "Restaurants", colSpan: 3, rowSpan: 2, h: "480px" },
  { key: "Food Trucks", colSpan: 2, rowSpan: 1, h: "350px" },
  { key: "Breakfast", colSpan: 2, rowSpan: 1, h: "350px" },
  { key: "Fast Food", colSpan: 2, rowSpan: 1, h: "350px" },
  { key: "Snacks", colSpan: 3, rowSpan: 1, h: "300px" },
  { key: "Desserts", colSpan: 3, rowSpan: 1, h: "300px" },
];

/* ====== Inside-category grid settings ====== */
const INSIDE_GRID_SETTINGS: Record<string, { columns: number; rowHeight: string }> = {
  default: { columns: 3, rowHeight: "1fr" },
  Cafes: { columns: 3, rowHeight: "1fr" },
  Restaurants: { columns: 3, rowHeight: "1fr" },
  "Food Trucks": { columns: 3, rowHeight: "1fr" },
  Breakfast: { columns: 3, rowHeight: "1fr" },
  "Fast Food": { columns: 3, rowHeight: "1fr" },
  Snacks: { columns: 3, rowHeight: "1fr" },
  Desserts: { columns: 3, rowHeight: "1fr" },
};

/* ====== Places Component ====== */
const Places = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    loadPlaces();
    setSelectedCategory(null);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredPlaces(places.filter((p) => p.category === selectedCategory));
    } else {
      setFilteredPlaces([]);
    }
  }, [selectedCategory, places]);

  async function loadPlaces() {
    try {
      setLoading(true);
      const data = await fetchPlacesFromSheet();
      setPlaces(data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load places. Please check Google Sheets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  /* Scroll-controlled background video */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let targetTime = 0;
    let currentTime = 0;
    let raf = 0;

    const update = () => {
      if (!isNaN(video.duration) && video.duration > 0) {
        currentTime += (targetTime - currentTime) * 0.12;
        video.currentTime = Math.max(0, Math.min(video.duration, currentTime));
      }
      raf = requestAnimationFrame(update);
    };

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const frac = Math.max(0, Math.min(1, maxScroll > 0 ? scrollTop / maxScroll : 0));
      if (!isNaN(video.duration) && video.duration > 0) targetTime = frac * video.duration;
    };

    const onLoaded = () => {
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
    };

    video.addEventListener("loadedmetadata", onLoaded);
    if (!isNaN(video.duration) && video.duration > 0) onLoaded();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      video.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  const getCategoryLayout = (name: string) =>
    CATEGORY_LAYOUT.find((c) => c.key === name) ?? { colSpan: 2, rowSpan: 1, h: "240px" };
  const getInsideGridSettings = (name?: string) =>
    INSIDE_GRID_SETTINGS[name ?? ""] ?? INSIDE_GRID_SETTINGS.default;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-[-10]"
      >
        <source src="/videos/bg-places.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-black/30 z-[-5]" />

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* MAIN: Explore Categories */}
          {!selectedCategory && (
            <>
              <h1
                className="text-4xl sm:text-5xl font-bold text-white mb-12 text-center"
                data-aos="fade-up"
              >
                Explore Categories
              </h1>

              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
                {categories.map((cat) => {
                  const layout = getCategoryLayout(cat.name);
                  return (
                    <div
                      key={cat.name}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedCategory(cat.name)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setSelectedCategory(cat.name)
                      }
                      data-aos="fade-up"
                      className="relative cursor-pointer overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-transform"
                      style={{
                        gridColumn: `span ${layout.colSpan}`,
                        gridRow: `span ${layout.rowSpan}`,
                        height: layout.h,
                        minHeight: layout.h,
                      }}
                    >
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">{cat.name}</h2>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* SELECTED CATEGORY GRID */}
          {selectedCategory && (
            <>
              <h1
                className="text-4xl sm:text-5xl font-bold text-white mb-6 text-center"
                data-aos="fade-up"
              >
                {selectedCategory}
              </h1>

              {loading && (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              )}

              {!loading && filteredPlaces.length > 0 && (() => {
                const settings = getInsideGridSettings(selectedCategory);
                return (
                  <div
                    data-aos="fade-up"
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${settings.columns}, 1fr)`,
                      gridAutoRows: "1fr",
                      gap: "16px",
                    }}
                  >
                    {filteredPlaces.map((place, i) => (
                      <div key={i} className="w-full h-full overflow-hidden">
                        <PlaceCard place={place} />
                      </div>
                    ))}
                  </div>
                );
              })()}

              {!loading && filteredPlaces.length === 0 && (
                <div className="text-center py-20" data-aos="fade-up">
                  <p className="text-xl text-white/80">No places found in this category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Back Button */}
      {selectedCategory && (
        <button
          onClick={() => setSelectedCategory(null)}
          className="fixed bottom-4 left-4 bg-white text-black px-4 py-2 rounded-lg shadow-lg hover:bg-gray-200 z-50 transition"
        >
          ← Back
        </button>
      )}
    </div>
  );
};

export default Places;
