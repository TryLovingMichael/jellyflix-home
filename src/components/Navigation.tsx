import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { clearJellyfinConfig } from "@/lib/jellyfin";

export const Navigation = () => {
  const navigate = useNavigate();
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

  const handleLogout = () => {
    clearJellyfinConfig();
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
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background' : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 md:px-12">
        <div className="flex items-center gap-8">
          <button onClick={handleNavigateHome}>
            <h1 className="text-2xl font-bold text-primary transition-opacity hover:opacity-80 md:text-3xl">
              JELLYFIN
            </h1>
          </button>
          
          <div className="hidden items-center gap-6 md:flex">
            <button
              onClick={handleNavigateHome}
              className="text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
            >
              Home
            </button>
          </div>
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
