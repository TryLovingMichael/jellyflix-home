import { JellyfinItem } from "@/lib/jellyfin";
import { Play } from "lucide-react";

interface MediaCardProps {
  item: JellyfinItem;
  imageUrl: string;
  onClick?: () => void;
}

export const MediaCard = ({ item, imageUrl, onClick }: MediaCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = `/player?id=${item.Id}`;
    }
  };

  return (
    <div
      className="group relative min-w-[150px] cursor-pointer transition-all duration-300 ease-out hover:scale-110 hover:z-10"
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-muted shadow-lg transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-primary/20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.Name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        
        {/* Hover overlay with enhanced gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-white drop-shadow-lg">
              {item.Name}
            </h3>
            <div className="space-y-1">
              {item.ProductionYear && (
                <p className="text-xs text-gray-300">{item.ProductionYear}</p>
              )}
              {item.CommunityRating && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-yellow-400">⭐</span>
                  <span className="text-xs text-gray-300">{item.CommunityRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced play button with pulse animation */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary opacity-20"></div>
              <Play className="relative z-10 h-8 w-8 fill-white text-white" />
            </div>
          </div>
        </div>
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
      </div>
    </div>
  );
};
