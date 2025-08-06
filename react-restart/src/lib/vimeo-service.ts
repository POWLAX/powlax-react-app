import { VideoMetadata, VimeoConfig } from '@/types/vimeo';

const VIMEO_API_BASE = 'https://api.vimeo.com';

class VimeoService {
  private accessToken: string | null;
  private hasApiAccess: boolean;

  constructor() {
    this.accessToken = process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN || null;
    this.hasApiAccess = !!this.accessToken;
  }

  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    // If no API access, return mock data structure
    if (!this.hasApiAccess) {
      return this.getMockMetadata(videoId);
    }

    try {
      const response = await fetch(`${VIMEO_API_BASE}/videos/${videoId}`, {
        headers: {
          'Authorization': `bearer ${this.accessToken}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        }
      });

      if (!response.ok) {
        console.warn(`Vimeo API error for video ${videoId}:`, response.status);
        return this.getMockMetadata(videoId);
      }

      const data = await response.json();
      
      return {
        id: videoId,
        title: data.name,
        duration: data.duration,
        thumbnail: data.pictures?.sizes?.[3]?.link || '',
        embed_html: data.embed?.html || this.getBasicEmbed(videoId),
        privacy: data.privacy?.view || 'anybody',
        created_time: data.created_time,
        stats: {
          plays: data.stats?.plays || 0
        }
      };
    } catch (error) {
      console.error('Vimeo API error:', error);
      return this.getMockMetadata(videoId);
    }
  }

  async trackVideoProgress(videoId: string, userId: string, progress: number) {
    // Store progress for gamification
    // This will integrate with your Supabase tables
    console.log(`Tracking progress: Video ${videoId}, User ${userId}, Progress ${progress}%`);
    
    // TODO: Implement Supabase tracking when ready
    return {
      videoId,
      userId,
      progress,
      timestamp: new Date().toISOString()
    };
  }

  getBasicEmbed(videoId: string, options?: { width?: number; height?: number }): string {
    const width = options?.width || 640;
    const height = options?.height || 360;
    
    return `<iframe 
      src="https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479" 
      width="${width}" 
      height="${height}" 
      frameborder="0" 
      allow="autoplay; fullscreen; picture-in-picture" 
      allowfullscreen>
    </iframe>`;
  }

  getResponsiveEmbed(videoId: string): string {
    return `
      <div style="padding:56.25% 0 0 0;position:relative;">
        <iframe 
          src="https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479" 
          frameborder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowfullscreen 
          style="position:absolute;top:0;left:0;width:100%;height:100%;">
        </iframe>
      </div>
    `;
  }

  private getMockMetadata(videoId: string): VideoMetadata {
    // Return mock data structure for development
    return {
      id: videoId,
      title: `Video ${videoId}`,
      duration: 180, // 3 minutes default
      thumbnail: `/api/placeholder/640/360`,
      embed_html: this.getBasicEmbed(videoId),
      privacy: 'anybody',
      created_time: new Date().toISOString(),
      stats: {
        plays: 0
      }
    };
  }

  extractVideoId(url: string): string | null {
    // Handle various Vimeo URL formats
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
      /vimeo\.com\/channels\/[\w]+\/(\d+)/,
      /vimeo\.com\/groups\/[\w]+\/videos\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }
}

export const vimeoService = new VimeoService();