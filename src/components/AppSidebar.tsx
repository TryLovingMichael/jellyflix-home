import { Film, Tv, Clock, Star, Home, Sparkles, Heart, Laugh, Swords, Drama, Ghost, Rocket, TrendingUp } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const libraryItems = [
  { title: "Home", url: "/browse", icon: Home },
  { title: "Movies", url: "/browse?type=movies", icon: Film },
  { title: "TV Shows", url: "/browse?type=tv", icon: Tv },
  { title: "Continue Watching", url: "/browse?type=continue", icon: Clock },
  { title: "Top Rated", url: "/browse?type=rated", icon: Star },
  { title: "Trending", url: "/browse?type=trending", icon: TrendingUp },
];

const genreItems = [
  { title: "Action", url: "/browse?genre=action", icon: Swords },
  { title: "Comedy", url: "/browse?genre=comedy", icon: Laugh },
  { title: "Drama", url: "/browse?genre=drama", icon: Drama },
  { title: "Sci-Fi", url: "/browse?genre=scifi", icon: Rocket },
  { title: "Horror", url: "/browse?genre=horror", icon: Ghost },
  { title: "Romance", url: "/browse?genre=romance", icon: Heart },
  { title: "Fantasy", url: "/browse?genre=fantasy", icon: Sparkles },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/20 text-primary font-semibold border-l-2 border-primary" 
      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-200";

  return (
    <Sidebar
      className={`border-r border-white/5 bg-black/80 backdrop-blur-xl transition-all duration-500 shadow-2xl ${
        collapsed ? "w-16" : "w-64"
      }`}
      collapsible="icon"
    >
      <SidebarHeader className={collapsed ? "p-2" : "p-4"}>
        {!collapsed && (
          <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Browse
          </h2>
        )}
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : "text-muted-foreground/80 text-xs uppercase tracking-widest mb-3 px-3 font-semibold"}>
            Library
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `${getNavCls({ isActive })} transition-all duration-300 hover:translate-x-1`
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className={collapsed ? "sr-only" : "text-muted-foreground/80 text-xs uppercase tracking-widest mb-3 px-3 font-semibold"}>
            Genres
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {genreItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `${getNavCls({ isActive })} transition-all duration-300 hover:translate-x-1`
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
