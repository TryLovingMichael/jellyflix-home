import { JellyfinItem } from "@/lib/jellyfin";
import { Play } from "lucide-react";

interface MediaCardProps {
  item: JellyfinItem;
  imageUrl: string;
  onClick?: () => void;
}

export const MediaCard = ({ item, imageUrl, onClick }: MediaCardProps) => {
  return (
    <div
      className="group relative min-w-[200px] cursor-pointer transition-all duration-300 ease-out hover:scale-110 hover:z-10"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.Name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-white">
              {item.Name}
            </h3>
            {item.ProductionYear && (
              <p className="text-xs text-gray-300">{item.ProductionYear}</p>
            )}
            {item.CommunityRating && (
              <p className="text-xs text-gray-300">
                ⭐ {item.CommunityRating.toFixed(1)}
              </p>
            )}
          </div>
          
          {/* Play button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
              <Play className="h-6 w-6 fill-white text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
