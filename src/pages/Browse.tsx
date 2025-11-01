import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JellyfinAPI, JellyfinItem, loadJellyfinConfig } from "@/lib/jellyfin";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { Navigation } from "@/components/Navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

const Browse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jellyfinAPI, setJellyfinAPI] = useState<JellyfinAPI | null>(null);
  const [heroItem, setHeroItem] = useState<JellyfinItem | null>(null);
  const [continueWatching, setContinueWatching] = useState<JellyfinItem[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<JellyfinItem[]>([]);
  const [movies, setMovies] = useState<JellyfinItem[]>([]);
  const [tvShows, setTVShows] = useState<JellyfinItem[]>([]);

  useEffect(() => {
    const initializeJellyfin = async () => {
      const config = loadJellyfinConfig();
      
      if (!config || !config.accessToken || !config.userId) {
        navigate("/login");
        return;
      }

      try {
        const api = new JellyfinAPI(config);
        setJellyfinAPI(api);

        // Fetch all content
        const [continueItems, recentItems, movieItems, tvItems] = await Promise.all([
          api.getContinueWatching(),
          api.getRecentlyAdded(),
          api.getMovies(),
          api.getTVShows(),
        ]);

        setContinueWatching(continueItems);
        setRecentlyAdded(recentItems);
        setMovies(movieItems);
        setTVShows(tvItems);

        // Set hero item (first from recently added or movies)
        const heroCandidate = recentItems[0] || movieItems[0] || tvItems[0];
        setHeroItem(heroCandidate);
      } catch (error) {
        console.error("Failed to fetch Jellyfin content:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    initializeJellyfin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <Navigation />
          <div className="flex-1">
            <Hero item={heroItem} jellyfinAPI={jellyfinAPI} />
            
            <div className="relative -mt-20 space-y-8 pb-12 px-4">
              {continueWatching.length > 0 && jellyfinAPI && (
                <MediaRow
                  title="Continue Watching"
                  items={continueWatching}
                  jellyfinAPI={jellyfinAPI}
                />
              )}
              
              {recentlyAdded.length > 0 && jellyfinAPI && (
                <MediaRow
                  title="Recently Added"
                  items={recentlyAdded}
                  jellyfinAPI={jellyfinAPI}
                />
              )}
              
              {movies.length > 0 && jellyfinAPI && (
                <MediaRow
                  title="Movies"
                  items={movies.slice(0, 20)}
                  jellyfinAPI={jellyfinAPI}
                />
              )}
              
              {tvShows.length > 0 && jellyfinAPI && (
                <MediaRow
                  title="TV Shows"
                  items={tvShows.slice(0, 20)}
                  jellyfinAPI={jellyfinAPI}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Browse;
