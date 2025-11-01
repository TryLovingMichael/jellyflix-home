import { JellyfinItem, JellyfinAPI } from "@/lib/jellyfin";
import { Play, Info } from "lucide-react";
import { Button } from "./ui/button";

interface HeroProps {
  item: JellyfinItem | null;
  jellyfinAPI: JellyfinAPI | null;
}

export const Hero = ({ item, jellyfinAPI }: HeroProps) => {
  if (!item || !jellyfinAPI) {
    return (
      <div className="relative h-[70vh] w-full bg-gradient-to-b from-muted to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  const backdropUrl = jellyfinAPI.getItemImageUrl(item, 'Backdrop');
  const logoUrl = jellyfinAPI.getItemImageUrl(item, 'Logo');

  return (
    <div className="relative h-[60vh] max-h-[800px] w-full overflow-hidden">
      {/* Backdrop image */}
      {backdropUrl && (
        <img
          src={backdropUrl}
          alt={item.Name}
          className="h-full w-full object-cover object-center"
        />
      )}
      
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-16 md:px-12 md:pb-20">
        <div className="max-w-2xl">
          {/* Logo or Title */}
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={item.Name}
              className="mb-6 h-24 w-auto object-contain md:h-32"
            />
          ) : (
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-6xl">
              {item.Name}
            </h1>
          )}
          
          {/* Metadata */}
          <div className="mb-4 flex items-center gap-3 text-sm text-foreground/80">
            {item.CommunityRating && (
              <span className="flex items-center gap-1">
                <span className="text-primary">⭐</span>
                {item.CommunityRating.toFixed(1)}
              </span>
            )}
            {item.ProductionYear && <span>{item.ProductionYear}</span>}
            {item.OfficialRating && (
              <span className="rounded border border-foreground/30 px-1.5 py-0.5 text-xs">
                {item.OfficialRating}
              </span>
            )}
          </div>
          
          {/* Overview */}
          {item.Overview && (
            <p className="mb-6 line-clamp-3 text-sm text-foreground/90 md:text-base">
              {item.Overview}
            </p>
          )}
          
          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => window.location.href = `/player?id=${item.Id}`}
              className="gap-2 bg-white text-black transition-all duration-300 hover:bg-white/90 hover:scale-105 shadow-xl hover:shadow-2xl font-semibold px-8"
            >
              <Play className="h-5 w-5 fill-current" />
              Play
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 bg-white/15 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:scale-105 border border-white/20 shadow-xl hover:shadow-2xl font-semibold px-8"
            >
              <Info className="h-5 w-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
