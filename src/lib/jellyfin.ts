export interface JellyfinConfig {
  serverUrl: string;
  username: string;
  password: string;
  userId?: string;
  accessToken?: string;
}

export interface JellyfinItem {
  Id: string;
  Name: string;
  Type: string;
  ImageTags?: {
    Primary?: string;
    Backdrop?: string;
    Logo?: string;
  };
  BackdropImageTags?: string[];
  Overview?: string;
  ProductionYear?: number;
  PremiereDate?: string;
  CommunityRating?: number;
  OfficialRating?: string;
  RunTimeTicks?: number;
  Genres?: string[];
  SeriesName?: string;
  IndexNumber?: number;
  ParentIndexNumber?: number;
}

export class JellyfinAPI {
  private config: JellyfinConfig;

  constructor(config: JellyfinConfig) {
    this.config = config;
  }

  private getImageUrl(itemId: string, imageType: string = 'Primary', tag?: string): string {
    if (!tag) return '';
    const baseUrl = this.config.serverUrl.replace(/\/$/, '');
    return `${baseUrl}/Items/${itemId}/Images/${imageType}?tag=${tag}&quality=90`;
  }

  async authenticate(): Promise<{ userId: string; accessToken: string }> {
    const response = await fetch(`${this.config.serverUrl}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': `MediaBrowser Client="Jellyfin Web", Device="Browser", DeviceId="jellyfin-web", Version="10.8.0"`,
      },
      body: JSON.stringify({
        Username: this.config.username,
        Pw: this.config.password,
      }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    return {
      userId: data.User.Id,
      accessToken: data.AccessToken,
    };
  }

  private async request(endpoint: string) {
    const response = await fetch(`${this.config.serverUrl}${endpoint}`, {
      headers: {
        'X-Emby-Authorization': `MediaBrowser Client="Jellyfin Web", Device="Browser", DeviceId="jellyfin-web", Version="10.8.0", Token="${this.config.accessToken}"`,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getMovies(): Promise<JellyfinItem[]> {
    const data = await this.request(
      `/Users/${this.config.userId}/Items?IncludeItemTypes=Movie&Recursive=true&Fields=PrimaryImageAspectRatio,BasicSyncInfo,Path&ImageTypeLimit=1&SortBy=SortName&SortOrder=Ascending`
    );
    return data.Items || [];
  }

  async getTVShows(): Promise<JellyfinItem[]> {
    const data = await this.request(
      `/Users/${this.config.userId}/Items?IncludeItemTypes=Series&Recursive=true&Fields=PrimaryImageAspectRatio,BasicSyncInfo&ImageTypeLimit=1&SortBy=SortName&SortOrder=Ascending`
    );
    return data.Items || [];
  }

  async getRecentlyAdded(): Promise<JellyfinItem[]> {
    const data = await this.request(
      `/Users/${this.config.userId}/Items/Latest?Fields=PrimaryImageAspectRatio,BasicSyncInfo&ImageTypeLimit=1&Limit=20`
    );
    return data || [];
  }

  async getContinueWatching(): Promise<JellyfinItem[]> {
    const data = await this.request(
      `/Users/${this.config.userId}/Items/Resume?MediaTypes=Video&Fields=PrimaryImageAspectRatio,BasicSyncInfo&ImageTypeLimit=1&Limit=20`
    );
    return data.Items || [];
  }

  async search(query: string): Promise<JellyfinItem[]> {
    const data = await this.request(
      `/Users/${this.config.userId}/Items?searchTerm=${encodeURIComponent(query)}&IncludeItemTypes=Movie,Series&Recursive=true&Fields=PrimaryImageAspectRatio,BasicSyncInfo&ImageTypeLimit=1&Limit=50`
    );
    return data.Items || [];
  }

  getItemImageUrl(item: JellyfinItem, type: 'Primary' | 'Backdrop' | 'Logo' = 'Primary'): string {
    if (type === 'Backdrop' && item.BackdropImageTags && item.BackdropImageTags.length > 0) {
      return this.getImageUrl(item.Id, 'Backdrop', item.BackdropImageTags[0]);
    }
    if (type === 'Logo' && item.ImageTags?.Logo) {
      return this.getImageUrl(item.Id, 'Logo', item.ImageTags.Logo);
    }
    if (item.ImageTags?.Primary) {
      return this.getImageUrl(item.Id, type, item.ImageTags.Primary);
    }
    return '';
  }
}

export const saveJellyfinConfig = (config: JellyfinConfig) => {
  localStorage.setItem('jellyfin_config', JSON.stringify(config));
};

export const loadJellyfinConfig = (): JellyfinConfig | null => {
  const stored = localStorage.getItem('jellyfin_config');
  return stored ? JSON.parse(stored) : null;
};

export const clearJellyfinConfig = () => {
  localStorage.removeItem('jellyfin_config');
};
