import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SidebarTrigger } from "./ui/sidebar";
import { clearJellyfinConfig } from "@/lib/jellyfin";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 's' key for search (when not in input)
      if (e.key === 's' && !showSearch && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Escape to close search
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
        setSearchQuery("");
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSearch]);

  const handleLogout = () => {
    clearJellyfinConfig();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleNavigateHome = () => {
    navigate('/browse');
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-black/95 backdrop-blur-xl shadow-2xl border-b border-white/5" 
          : "bg-gradient-to-b from-black/90 via-black/50 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div 
          onClick={handleNavigateHome}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <SidebarTrigger className="text-white hover:bg-white/10 transition-all duration-300 rounded-lg p-2.5 hover:scale-110" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300 drop-shadow-lg">
            Jellyfin
          </h1>
        </div>
        
        <div className="hidden items-center gap-6 md:flex">
          {!showSearch && (
            <button
              onClick={handleNavigateHome}
              className="text-sm font-medium text-foreground/90 transition-all duration-300 hover:text-foreground hover:scale-105"
            >
              Home
            </button>
          )}
        </div>
        
        {showSearch ? (
          <form onSubmit={handleSearch} className="flex flex-1 max-w-md mx-8 gap-2">
            <Input
              type="text"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="bg-black/50 text-foreground border-white/20 placeholder:text-foreground/50"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              className="text-foreground hover:bg-white/10"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-foreground hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
