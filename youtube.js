const YOUTUBE_API = {
  baseUrl: window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : '',

  async isAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) return false;
      const data = await response.json();
      return data.status === 'ok';
    } catch (e) {
      return false;
    }
  },

  getProxyUrl(videoId) {
    const cleanId = videoId.replace('yt_', '');
    return `${this.baseUrl}/audio/${cleanId}`;
  },

  async searchSongs(query, limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  async getTrending(limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/trending?limit=${limit}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return (data.success && data.data) ? data.data : [];
    } catch (error) {
      return [];
    }
  },

  async getHome(limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/home?limit=${limit}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return (data.success && data.data) ? data.data : [];
    } catch (error) {
      return [];
    }
  },

  async getRelated(videoId, limit = 10) {
    try {
      const cleanId = videoId.replace('yt_', '');
      const response = await fetch(`${this.baseUrl}/related/${cleanId}?limit=${limit}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return (data.success && data.data) ? data.data : [];
    } catch (error) {
      return [];
    }
  },

  async getStreamUrl(videoId) {
    try {
      const cleanId = videoId.replace('yt_', '');
      const response = await fetch(`${this.baseUrl}/stream/${cleanId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};
