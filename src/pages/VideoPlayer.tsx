import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { JellyfinAPI, JellyfinItem, loadJellyfinConfig } from "@/lib/jellyfin";
import { ArrowLeft, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

const VideoPlayer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("id");
  const [jellyfinAPI, setJellyfinAPI] = useState<JellyfinAPI | null>(null);
  const [item, setItem] = useState<JellyfinItem | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = loadJellyfinConfig();
    if (!config || !config.accessToken || !config.userId || !itemId) {
      navigate("/browse");
      return;
    }

    const api = new JellyfinAPI(config);
    setJellyfinAPI(api);

    // Construct video URL
    const baseUrl = config.serverUrl.replace(/\/$/, '');
    const url = `${baseUrl}/Videos/${itemId}/stream?static=true&mediaSourceId=${itemId}&api_key=${config.accessToken}`;
    setVideoUrl(url);

    // Fetch item details
    fetch(`${baseUrl}/Users/${config.userId}/Items/${itemId}`, {
      headers: {
        'X-Emby-Authorization': `MediaBrowser Client="Jellyfin Web", Device="Browser", DeviceId="jellyfin-web", Version="10.8.0", Token="${config.accessToken}"`,
      },
    })
      .then(res => res.json())
      .then(data => setItem(data))
      .catch(console.error);
  }, [itemId, navigate]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!videoUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black">
      {/* Back button overlay */}
      <div className="absolute left-4 top-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/browse")}
          className="bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      {/* Video controls overlay */}
      <div className="absolute bottom-4 right-4 z-50 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
      </div>

      {/* Video info overlay */}
      {item && (
        <div className="absolute left-4 top-20 z-40 max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold text-white drop-shadow-lg">
            {item.Name}
          </h1>
          {item.SeriesName && (
            <p className="text-lg text-white/90 drop-shadow-lg">
              {item.SeriesName} {item.ParentIndexNumber && `- Season ${item.ParentIndexNumber}`}
              {item.IndexNumber && ` Episode ${item.IndexNumber}`}
            </p>
          )}
        </div>
      )}

      {/* Video player */}
      <video
        ref={videoRef}
        className="h-screen w-full"
        src={videoUrl}
        controls
        autoPlay
        onError={(e) => {
          console.error("Video playback error:", e);
        }}
      />
    </div>
  );
};

export default VideoPlayer;
