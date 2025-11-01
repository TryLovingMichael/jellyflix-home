import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { JellyfinAPI, JellyfinItem, loadJellyfinConfig } from "@/lib/jellyfin";
import { Navigation } from "@/components/Navigation";
import { MediaCard } from "@/components/MediaCard";
import { Loader2 } from "lucide-react";

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [loading, setLoading] = useState(true);
  const [jellyfinAPI, setJellyfinAPI] = useState<JellyfinAPI | null>(null);
  const [results, setResults] = useState<JellyfinItem[]>([]);

  useEffect(() => {
    const initializeSearch = async () => {
      const config = loadJellyfinConfig();
      
      if (!config || !config.accessToken || !config.userId) {
        navigate("/login");
        return;
      }

      try {
        const api = new JellyfinAPI(config);
        setJellyfinAPI(api);

        if (query) {
          const searchResults = await api.search(query);
          setResults(searchResults);
        }
      } catch (error) {
        console.error("Failed to search:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeSearch();
  }, [navigate, query]);

  const handleItemClick = (itemId: string) => {
    navigate(`/player?id=${itemId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="px-4 pt-24 md:px-12">
        <h1 className="mb-8 text-3xl font-bold text-foreground">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>
        
        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 pb-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((item) => (
              <div key={item.Id} onClick={() => handleItemClick(item.Id)}>
                <MediaCard
                  item={item}
                  imageUrl={jellyfinAPI?.getItemImageUrl(item, 'Primary') || ''}
                />
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="py-16 text-center">
            <p className="text-xl text-muted-foreground">
              No results found for "{query}"
            </p>
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-xl text-muted-foreground">
              Enter a search term to find movies and TV shows
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
