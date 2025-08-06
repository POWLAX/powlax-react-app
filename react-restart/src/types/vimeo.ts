export interface VideoMetadata {
  id: string;
  title: string;
  duration: number; // in seconds
  thumbnail: string;
  embed_html: string;
  privacy: string;
  created_time: string;
  stats: {
    plays: number;
  };
}

export interface VimeoConfig {
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface VideoProgress {
  videoId: string;
  userId: string;
  progress: number; // percentage 0-100
  timestamp: string;
  completed: boolean;
  pointsEarned?: number;
}