/**
 * WordPress REST API integration for POWLAX data migration
 * Handles authentication and data fetching from WordPress site
 */

interface WordPressApiConfig {
  baseUrl: string;
  username?: string;
  appPassword?: string;
  jwtToken?: string;
}

interface WordPressDrill {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  meta: {
    _drill_category?: string;
    _drill_duration?: number;
    _drill_video_url?: string;
    _drill_lab_url_1?: string;
    _drill_lab_url_2?: string;
    _drill_lab_url_3?: string;
    _drill_lab_url_4?: string;
    _drill_lab_url_5?: string;
    _drill_notes?: string;
  };
}

class WordPressAPI {
  private config: WordPressApiConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.WORDPRESS_API_URL || '',
      username: process.env.WORDPRESS_USERNAME,
      appPassword: process.env.WORDPRESS_APP_PASSWORD,
      jwtToken: process.env.WORDPRESS_JWT_TOKEN,
    };
  }

  private ensureConfigured() {
    if (!this.config.baseUrl) {
      throw new Error('WORDPRESS_API_URL environment variable is required');
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Application Password authentication
    if (this.config.username && this.config.appPassword) {
      const credentials = btoa(`${this.config.username}:${this.config.appPassword}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }
    // JWT Token authentication
    else if (this.config.jwtToken) {
      headers['Authorization'] = `Bearer ${this.config.jwtToken}`;
    }

    return headers;
  }

  async fetchDrills(page = 1, perPage = 100): Promise<WordPressDrill[]> {
    this.ensureConfigured();
    try {
      const url = `${this.config.baseUrl}/posts?per_page=${perPage}&page=${page}&post_type=drill`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }

      const drills: WordPressDrill[] = await response.json();
      return drills;
    } catch (error) {
      console.error('Error fetching drills from WordPress:', error);
      throw error;
    }
  }

  async fetchCustomDrills(): Promise<any[]> {
    this.ensureConfigured();
    try {
      // If using custom POWLAX endpoints
      const customEndpoint = process.env.WORDPRESS_DRILLS_ENDPOINT || '/drills';
      const url = `${this.config.baseUrl.replace('/wp/v2', '')}${customEndpoint}`;
      
      const headers = this.getAuthHeaders();
      
      // Add custom API key if available
      if (process.env.WORDPRESS_CUSTOM_API_KEY) {
        headers['X-API-Key'] = process.env.WORDPRESS_CUSTOM_API_KEY;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`WordPress Custom API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching custom drills:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    this.ensureConfigured();
    try {
      const url = `${this.config.baseUrl}/posts?per_page=1`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('WordPress connection test failed:', error);
      return false;
    }
  }

  // Transform WordPress drill data to your app format
  transformDrillData(wpDrill: WordPressDrill): any {
    return {
      id: wpDrill.id,
      title: wpDrill.title.rendered,
      content: wpDrill.content.rendered,
      category: wpDrill.meta._drill_category || 'Uncategorized',
      duration: wpDrill.meta._drill_duration || 0,
      video_url: wpDrill.meta._drill_video_url || '',
      lab_urls: [
        wpDrill.meta._drill_lab_url_1,
        wpDrill.meta._drill_lab_url_2,
        wpDrill.meta._drill_lab_url_3,
        wpDrill.meta._drill_lab_url_4,
        wpDrill.meta._drill_lab_url_5,
      ].filter(Boolean),
      notes: wpDrill.meta._drill_notes || '',
      // Add any other transformations needed
    };
  }
}

export const wordpressAPI = new WordPressAPI();
export type { WordPressDrill };