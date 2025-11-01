import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { JellyfinAPI, JellyfinItem, loadJellyfinConfig } from "@/lib/jellyfin";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { Navigation } from "@/components/Navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Browse = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get("type");
  const filterGenre = searchParams.get("genre");
  
  const [loading, setLoading] = useState(true);
  const [jellyfinAPI, setJellyfinAPI] = useState<JellyfinAPI | null>(null);
  const [heroItem, setHeroItem] = useState<JellyfinItem | null>(null);
  const [continueWatching, setContinueWatching] = useState<JellyfinItem[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<JellyfinItem[]>([]);
  const [movies, setMovies] = useState<JellyfinItem[]>([]);
  const [tvShows, setTVShows] = useState<JellyfinItem[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "rating" | "year" | "added">("added");

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

        // Fetch content based on filters
        let contentToShow: JellyfinItem[] = [];
        
        // Handle type filters
        if (filterType === "movies") {
          const movieItems = await api.getMovies();
          setMovies(movieItems);
          contentToShow = movieItems;
          setContinueWatching([]);
          setRecentlyAdded([]);
          setTVShows([]);
        } else if (filterType === "tv") {
          const tvItems = await api.getTVShows();
          setTVShows(tvItems);
          contentToShow = tvItems;
          setContinueWatching([]);
          setRecentlyAdded([]);
          setMovies([]);
        } else if (filterType === "continue") {
          const continueItems = await api.getContinueWatching();
          setContinueWatching(continueItems);
          contentToShow = continueItems;
          setRecentlyAdded([]);
          setMovies([]);
          setTVShows([]);
        } else if (filterType === "rated") {
          // Get all movies and TV shows, then filter by rating
          const [movieItems, tvItems] = await Promise.all([
            api.getMovies(),
            api.getTVShows(),
          ]);
          const allContent = [...movieItems, ...tvItems]
            .filter(item => item.CommunityRating && item.CommunityRating >= 7.5)
            .sort((a, b) => (b.CommunityRating || 0) - (a.CommunityRating || 0));
          setMovies(allContent.filter(i => i.Type === "Movie"));
          setTVShows(allContent.filter(i => i.Type === "Series"));
          contentToShow = allContent;
          setContinueWatching([]);
          setRecentlyAdded([]);
        } else if (filterType === "trending") {
          // Get recently added as "trending"
          const recentItems = await api.getRecentlyAdded();
          setRecentlyAdded(recentItems);
          contentToShow = recentItems;
          setContinueWatching([]);
          setMovies([]);
          setTVShows([]);
        } else if (filterGenre) {
          // Filter by genre
          const [movieItems, tvItems] = await Promise.all([
            api.getMovies(),
            api.getTVShows(),
          ]);
          const genreMap: { [key: string]: string } = {
            action: "Action",
            comedy: "Comedy",
            drama: "Drama",
            scifi: "Science Fiction",
            horror: "Horror",
            romance: "Romance",
            fantasy: "Fantasy",
          };
          const targetGenre = genreMap[filterGenre.toLowerCase()];
          const filteredContent = [...movieItems, ...tvItems].filter(item => 
            item.Genres && item.Genres.some(g => 
              g.toLowerCase().includes(targetGenre.toLowerCase())
            )
          );
          setMovies(filteredContent.filter(i => i.Type === "Movie"));
          setTVShows(filteredContent.filter(i => i.Type === "Series"));
          contentToShow = filteredContent;
          setContinueWatching([]);
          setRecentlyAdded([]);
        } else {
          // Default: show all content
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
          contentToShow = [...recentItems, ...movieItems, ...tvItems];
        }

        // Set hero item
        const heroCandidate = contentToShow[0] || null;
        setHeroItem(heroCandidate);
      } catch (error) {
        console.error("Failed to fetch Jellyfin content:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    initializeJellyfin();
  }, [navigate, filterType, filterGenre]);

  // Sort content based on selected option
  const sortContent = (items: JellyfinItem[]) => {
    const sorted = [...items];
    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => (a.Name || "").localeCompare(b.Name || ""));
      case "rating":
        return sorted.sort((a, b) => (b.CommunityRating || 0) - (a.CommunityRating || 0));
      case "year":
        return sorted.sort((a, b) => (b.ProductionYear || 0) - (a.ProductionYear || 0));
      case "added":
      default:
        return sorted.sort((a, b) => {
          const dateA = a.DateCreated ? new Date(a.DateCreated).getTime() : 0;
          const dateB = b.DateCreated ? new Date(b.DateCreated).getTime() : 0;
          return dateB - dateA;
        });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background overflow-hidden">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-x-hidden">
          <Navigation />
          <div className="flex-1 overflow-x-hidden">
            <Hero item={heroItem} jellyfinAPI={jellyfinAPI} />
            
            <div className="relative -mt-20 space-y-10 pb-16 px-4">
              {/* Dynamic page title based on filter */}
              {(filterType || filterGenre) && (
                <div className="mb-8 px-4 md:px-8 flex items-center justify-between">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {filterType === "movies" && "Movies"}
                    {filterType === "tv" && "TV Shows"}
                    {filterType === "continue" && "Continue Watching"}
                    {filterType === "rated" && "Top Rated"}
                    {filterType === "trending" && "Trending Now"}
                    {filterGenre && `${filterGenre.charAt(0).toUpperCase() + filterGenre.slice(1)} ${movies.length > 0 && tvShows.length > 0 ? "Movies & Shows" : movies.length > 0 ? "Movies" : "Shows"}`}
                  </h1>
                  
                  {/* Sort dropdown - hide for continue watching */}
                  {filterType !== "continue" && (movies.length > 0 || tvShows.length > 0) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <ArrowUpDown className="h-4 w-4" />
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSortBy("added")}>
                          Recently Added
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("name")}>
                          Name (A-Z)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("rating")}>
                          Rating (High to Low)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("year")}>
                          Year (Newest)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
              
              {continueWatching.length > 0 && jellyfinAPI && (
                <MediaRow
                  title="Continue Watching"
                  items={continueWatching}
                  jellyfinAPI={jellyfinAPI}
                  showProgress={true}
                />
              )}
              
              {recentlyAdded.length > 0 && jellyfinAPI && (
                <MediaRow
                  title={filterType === "trending" ? "Trending Now" : "Recently Added"}
                  items={sortContent(recentlyAdded)}
                  jellyfinAPI={jellyfinAPI}
                />
              )}
              
              {movies.length > 0 && jellyfinAPI && (
                <MediaRow
                  title={filterType === "movies" || filterGenre ? filterGenre ? `${filterGenre.charAt(0).toUpperCase() + filterGenre.slice(1)} Movies` : "All Movies" : "Movies"}
                  items={sortContent(movies).slice(0, 20)}
                  jellyfinAPI={jellyfinAPI}
                />
              )}
              
              {tvShows.length > 0 && jellyfinAPI && (
                <MediaRow
                  title={filterType === "tv" || filterGenre ? filterGenre ? `${filterGenre.charAt(0).toUpperCase() + filterGenre.slice(1)} Shows` : "All TV Shows" : "TV Shows"}
                  items={sortContent(tvShows).slice(0, 20)}
                  jellyfinAPI={jellyfinAPI}
                />
              )}
              
              {/* No content message */}
              {!loading && movies.length === 0 && tvShows.length === 0 && continueWatching.length === 0 && recentlyAdded.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <p className="text-xl text-muted-foreground">No content found for this filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <ScrollToTop />
      </div>
    </SidebarProvider>
  );
};

export default Browse;
