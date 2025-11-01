import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Search } from "lucide-react";
import { Button } from "./ui/button";
import { clearJellyfinConfig } from "@/lib/jellyfin";

export const Navigation = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background' : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 md:px-12">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-primary md:text-3xl">JELLYFIN</h1>
          
          <div className="hidden items-center gap-6 md:flex">
            <button className="text-sm font-medium text-foreground transition-colors hover:text-foreground/80">
              Home
            </button>
            <button className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground">
              TV Shows
            </button>
            <button className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground">
              Movies
            </button>
            <button className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground">
              Latest
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
