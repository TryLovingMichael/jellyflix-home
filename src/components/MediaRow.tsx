import { JellyfinItem, JellyfinAPI } from "@/lib/jellyfin";
import { MediaCard } from "./MediaCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

interface MediaRowProps {
  title: string;
  items: JellyfinItem[];
  jellyfinAPI: JellyfinAPI;
}

export const MediaRow = ({ title, items, jellyfinAPI }: MediaRowProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    const newScrollLeft = direction === 'left' 
      ? scrollContainerRef.current.scrollLeft - scrollAmount
      : scrollContainerRef.current.scrollLeft + scrollAmount;
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  if (!items.length) return null;

  return (
    <div className="group/row relative mb-8 px-4 md:px-12">
      <h2 className="mb-4 text-xl font-semibold text-foreground md:text-2xl">
        {title}
      </h2>
      
      <div className="relative">
        {/* Left arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 z-20 flex h-full items-center bg-gradient-to-r from-background via-background/90 to-transparent pl-2 pr-10 opacity-0 transition-opacity duration-300 group-hover/row:opacity-100"
            aria-label="Scroll left"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 backdrop-blur-sm transition-all hover:bg-black/90 hover:scale-110">
              <ChevronLeft className="h-9 w-9 text-white drop-shadow-lg" />
            </div>
          </button>
        )}

        {/* Right arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 z-20 flex h-full items-center bg-gradient-to-l from-background via-background/90 to-transparent pl-10 pr-2 opacity-0 transition-opacity duration-300 group-hover/row:opacity-100"
            aria-label="Scroll right"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 backdrop-blur-sm transition-all hover:bg-black/90 hover:scale-110">
              <ChevronRight className="h-9 w-9 text-white drop-shadow-lg" />
            </div>
          </button>
        )}

        {/* Media cards container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="scroll-smooth-custom flex gap-2 overflow-x-auto pb-4"
        >
          {items.map((item) => (
            <MediaCard
              key={item.Id}
              item={item}
              imageUrl={jellyfinAPI.getItemImageUrl(item, 'Primary')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
