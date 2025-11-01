import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { JellyfinAPI, JellyfinItem, loadJellyfinConfig } from "@/lib/jellyfin";
import { Navigation } from "@/components/Navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, Star, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MediaDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [jellyfinAPI, setJellyfinAPI] = useState<JellyfinAPI | null>(null);
  const [item, setItem] = useState<JellyfinItem | null>(null);
  const [seasons, setSeasons] = useState<JellyfinItem[]>([]);
  const [episodes, setEpisodes] = useState<{ [key: string]: JellyfinItem[] }>({});

  useEffect(() => {
    const initialize = async () => {
      const config = loadJellyfinConfig();
      
      if (!config || !config.accessToken || !config.userId || !itemId) {
        navigate("/login");
        return;
      }

      try {
        const api = new JellyfinAPI(config);
        setJellyfinAPI(api);

        const itemDetails = await api.getItemDetails(itemId);
        setItem(itemDetails);

        // If it's a TV series, fetch seasons and episodes
        if (itemDetails.Type === "Series") {
          const seasonsData = await api.getSeasons(itemId);
          setSeasons(seasonsData);

          // Fetch episodes for each season
          const episodesData: { [key: string]: JellyfinItem[] } = {};
          for (const season of seasonsData) {
            const eps = await api.getEpisodes(itemId, season.Id);
            episodesData[season.Id] = eps;
          }
          setEpisodes(episodesData);
        }
      } catch (error) {
        console.error("Failed to fetch media details:", error);
        navigate("/browse");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [itemId, navigate]);

  const handlePlay = (playItemId: string) => {
    navigate(`/player?id=${playItemId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!item || !jellyfinAPI) {
    return null;
  }

  const backdropUrl = jellyfinAPI.getItemImageUrl(item, 'Backdrop');
  const posterUrl = jellyfinAPI.getItemImageUrl(item, 'Primary');

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <Navigation />
          
          <div className="flex-1">
            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px]">
              {backdropUrl && (
                <img
                  src={backdropUrl}
                  alt={item.Name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex gap-6 items-end">
                  {posterUrl && (
                    <img
                      src={posterUrl}
                      alt={item.Name}
                      className="w-48 rounded-lg shadow-2xl hidden md:block"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {item.Name}
                    </h1>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                      {item.ProductionYear && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {item.ProductionYear}
                        </div>
                      )}
                      {item.CommunityRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {item.CommunityRating.toFixed(1)}
                        </div>
                      )}
                      {item.OfficialRating && (
                        <span className="px-2 py-0.5 border border-gray-400 rounded">
                          {item.OfficialRating}
                        </span>
                      )}
                    </div>

                    {item.Type === "Movie" && (
                      <Button
                        size="lg"
                        onClick={() => handlePlay(item.Id)}
                        className="gap-2 px-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
                      >
                        <Play className="h-5 w-5 fill-white" />
                        Play
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8 max-w-7xl">
              {item.Overview && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.Overview}
                  </p>
                </div>
              )}

              {item.Genres && item.Genres.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Genres</h2>
                  <div className="flex flex-wrap gap-2">
                    {item.Genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seasons and Episodes for TV Shows */}
              {item.Type === "Series" && seasons.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Seasons & Episodes</h2>
                  
                  <Tabs defaultValue={seasons[0]?.Id} className="w-full">
                    <TabsList className="mb-4">
                      {seasons.map((season) => (
                        <TabsTrigger key={season.Id} value={season.Id}>
                          {season.Name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {seasons.map((season) => (
                      <TabsContent key={season.Id} value={season.Id}>
                        <div className="grid gap-4">
                          {episodes[season.Id]?.map((episode) => (
                            <Card key={episode.Id} className="overflow-hidden bg-card/50 backdrop-blur-sm border-white/5 hover:bg-card/70 transition-all duration-300 hover:shadow-xl hover:border-primary/20">
                              <div className="flex gap-4 p-4">
                                <div className="relative w-48 aspect-video bg-muted rounded-lg overflow-hidden shrink-0 group/thumb">
                                  {jellyfinAPI.getItemImageUrl(episode, 'Primary') && (
                                    <img
                                      src={jellyfinAPI.getItemImageUrl(episode, 'Primary')}
                                      alt={episode.Name}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all duration-300">
                                    <Button
                                      size="icon"
                                      onClick={() => handlePlay(episode.Id)}
                                      className="rounded-full shadow-xl hover:scale-110 transition-all duration-300"
                                    >
                                      <Play className="h-5 w-5 fill-white" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <div>
                                      <h3 className="font-semibold text-lg">
                                        {episode.IndexNumber}. {episode.Name}
                                      </h3>
                                      {episode.RunTimeTicks && (
                                        <p className="text-sm text-muted-foreground">
                                          {Math.round(episode.RunTimeTicks / 600000000)} min
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      onClick={() => handlePlay(episode.Id)}
                                      className="gap-2 shrink-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                      <Play className="h-4 w-4 fill-white" />
                                      Play
                                    </Button>
                                  </div>
                                  
                                  {episode.Overview && (
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                      {episode.Overview}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MediaDetail;
