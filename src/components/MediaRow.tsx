import { JellyfinItem, JellyfinAPI } from "@/lib/jellyfin";
import { MediaCard } from "./MediaCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

interface MediaRowProps {
  title: string;
  items: JellyfinItem[];
  jellyfinAPI: JellyfinAPI;
  showProgress?: boolean;
}

export const MediaRow = ({ title, items, jellyfinAPI, showProgress = false }: MediaRowProps) => {
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
    <div className="group/row relative mb-10 px-4 md:px-12">
      <h2 className="mb-5 text-xl font-semibold text-foreground md:text-2xl tracking-tight">
        {title}
      </h2>
      
      <div className="relative">
        {/* Left arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 z-20 flex h-full items-center bg-gradient-to-r from-background via-background/95 to-transparent pl-2 pr-12 opacity-0 transition-all duration-500 group-hover/row:opacity-100"
            aria-label="Scroll left"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/80 backdrop-blur-md transition-all duration-300 hover:bg-primary hover:scale-125 shadow-2xl hover:shadow-primary/50 border border-white/10">
              <ChevronLeft className="h-8 w-8 text-white drop-shadow-2xl" />
            </div>
          </button>
        )}

        {/* Right arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 z-20 flex h-full items-center bg-gradient-to-l from-background via-background/95 to-transparent pl-12 pr-2 opacity-0 transition-all duration-500 group-hover/row:opacity-100"
            aria-label="Scroll right"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/80 backdrop-blur-md transition-all duration-300 hover:bg-primary hover:scale-125 shadow-2xl hover:shadow-primary/50 border border-white/10">
              <ChevronRight className="h-8 w-8 text-white drop-shadow-2xl" />
            </div>
          </button>
        )}

        {/* Media cards container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="scroll-smooth-custom flex gap-3 overflow-x-auto pb-6"
        >
          {items.map((item) => (
            <MediaCard
              key={item.Id}
              item={item}
              imageUrl={jellyfinAPI.getItemImageUrl(item, 'Primary')}
              showProgress={showProgress}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
