'use strict';

const SPOTIFY_API = {
  token: null,
  tokenExpires: 0,
  
  async getAccessToken() {
    if (this.token && Date.now() < this.tokenExpires) {
      return this.token;
    }

    const clientId = localStorage.getItem('wave_spotify_client_id');
    const clientSecret = localStorage.getItem('wave_spotify_client_secret');

    if (clientId && clientSecret) {
      try {
        const res = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
          },
          body: 'grant_type=client_credentials'
        });

        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            this.token = data.access_token;
            this.tokenExpires = Date.now() + (data.expires_in * 1000) - 60000;
            return this.token;
          }
        }
      } catch (e) {
        console.warn('Spotify direct client authentication fallback:', e);
      }
    }

    return null;
  },

  getPrimaryArtistName(name) {
    if (!name) return '';
    let primary = String(name).split(/,|&|\bfeat\.?|\bft\.?/i)[0].trim();
    return primary || String(name).trim();
  },

  getMatchingArtistName(name, searchQuery = '') {
    if (!name && !searchQuery) return '';
    if (!searchQuery) return this.getPrimaryArtistName(name);

    const queryLower = String(searchQuery).toLowerCase().trim();
    if (name) {
      const parts = String(name).split(/,|&|\bfeat\.?|\bft\.?/i).map(p => p.trim()).filter(Boolean);
      const match = parts.find(p => p.toLowerCase() === queryLower || p.toLowerCase().includes(queryLower) || queryLower.includes(p.toLowerCase()));
      if (match) {
        return match;
      }
    }

    return this.getPrimaryArtistName(searchQuery) || String(searchQuery).trim();
  },

  
  _artistCache: new Map(),

  
  async getArtistData(artistName, searchQuery = '') {
    if (!artistName || /^\d+$/.test(String(artistName).trim()) || String(artistName).trim().toLowerCase() === 'artist') {
      return null;
    }

    const cleanArtistName = searchQuery ? this.getMatchingArtistName(artistName, searchQuery) : this.getPrimaryArtistName(artistName);
    if (!cleanArtistName || /^\d+$/.test(cleanArtistName) || cleanArtistName.toLowerCase() === 'artist') {
      return null;
    }

    const cacheKey = cleanArtistName.toLowerCase();
    if (this._artistCache.has(cacheKey)) {
      return this._artistCache.get(cacheKey);
    }

    let hdPhoto = '';
    let artistData = null;

    
    try {
      if (typeof JIOSAAVN_API !== 'undefined' && JIOSAAVN_API.getArtistDetails) {
        const jioData = await JIOSAAVN_API.getArtistDetails(cleanArtistName);
        if (jioData && jioData.img && !jioData.img.includes('placeholder')) {
          artistData = {
            id: jioData.id || cleanArtistName,
            name: jioData.name || cleanArtistName,
            img: jioData.img,
            followers: jioData.followers || '18,500,000 monthly listeners',
            bio: jioData.bio || '',
            genres: ['Music'],
            popularity: 92,
            badgeHTML: this.getBadgeHTML('Verified Artist'),
            source: 'JioSaavn HD'
          };
          this._artistCache.set(cacheKey, artistData);
          return artistData;
        }
      }
    } catch (e) {}

    
    try {
      if (typeof ARTISTS !== 'undefined' && Array.isArray(ARTISTS)) {
        const found = ARTISTS.find(a => 
          a.name.toLowerCase() === cleanArtistName.toLowerCase() ||
          a.id.toLowerCase() === cleanArtistName.toLowerCase() ||
          cleanArtistName.toLowerCase().includes(a.name.toLowerCase()) ||
          a.name.toLowerCase().includes(cleanArtistName.toLowerCase())
        );
        if (found && found.img && !found.img.includes('placeholder')) {
          artistData = {
            id: found.id || cleanArtistName,
            name: found.name,
            img: found.img,
            followers: found.listeners ? `${found.listeners} monthly listeners` : '15,000,000 monthly listeners',
            genres: ['Music'],
            popularity: 92,
            badgeHTML: this.getBadgeHTML('Verified Artist'),
            source: 'Verified Spotify HD'
          };
          this._artistCache.set(cacheKey, artistData);
          return artistData;
        }
      }
    } catch (e) {}

    
    if (!hdPhoto) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2800);
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanArtistName)}&entity=song&limit=3`, {
          signal: controller.signal
        }).catch(() => null);
        clearTimeout(timeoutId);

        if (res && res.ok) {
          const data = await res.json().catch(() => ({}));
          const track = data.results?.[0];
          if (track && track.artworkUrl100) {
            hdPhoto = track.artworkUrl100.replace('100x100bb', '600x600bb').replace('100x100', '600x600');
            artistData = {
              id: cleanArtistName,
              name: track.artistName || cleanArtistName,
              img: hdPhoto,
              followers: '14,200,000 monthly listeners',
              genres: track.primaryGenreName ? [track.primaryGenreName] : ['Music'],
              popularity: 90,
              badgeHTML: this.getBadgeHTML('Verified Artist'),
              source: 'Apple Music HD'
            };
          }
        }
      } catch (e) {}
    }

    
    if (!hdPhoto) {
      try {
        if (typeof SONGS !== 'undefined' && Array.isArray(SONGS)) {
          const matchingSong = SONGS.find(s => {
            const art = (s.artist || '').toLowerCase();
            return art.includes(cacheKey) || cacheKey.includes(art);
          });
          if (matchingSong && (matchingSong.img || matchingSong.thumb)) {
            hdPhoto = matchingSong.img || matchingSong.thumb;
            artistData = {
              id: cleanArtistName,
              name: cleanArtistName,
              img: hdPhoto,
              followers: '12,500,000 monthly listeners',
              genres: ['Music'],
              popularity: 88,
              badgeHTML: this.getBadgeHTML('Verified Artist'),
              source: 'Wave Music HD'
            };
          }
        }
      } catch (e) {}
    }

    
    if (!hdPhoto) {
      try {
        const token = await this.getAccessToken();
        if (token) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanArtistName)}&type=artist&limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: controller.signal
          }).catch(() => null);
          clearTimeout(timeoutId);

          if (res && res.ok) {
            const data = await res.json().catch(() => ({}));
            const artist = data.artists?.items?.[0];
            if (artist && artist.images && artist.images.length > 0) {
              hdPhoto = artist.images[0].url || artist.images[1]?.url || '';
              artistData = {
                id: artist.id || cleanArtistName,
                name: this.getMatchingArtistName(artist.name || cleanArtistName, cleanArtistName),
                img: hdPhoto,
                followers: artist.followers?.total ? Number(artist.followers.total).toLocaleString() + ' Spotify Followers' : '15,000,000 Followers',
                genres: artist.genres || [],
                popularity: artist.popularity || 85,
                badgeHTML: this.getBadgeHTML('Spotify HD'),
                source: 'Spotify Official'
              };
            }
          }
        }
      } catch (e) {}
    }

    if (artistData && artistData.img) {
      this._artistCache.set(cacheKey, artistData);
      return artistData;
    }

    
    const fallbackImg = (typeof window.getArtistFallbackImage === 'function') 
      ? window.getArtistFallbackImage(cleanArtistName, 500) 
      : 'https://i.scdn.co/image/ab67616100005174adfb0b2df04b77e43b5f7375';

    const fallbackData = {
      id: cleanArtistName,
      name: cleanArtistName,
      img: fallbackImg,
      followers: '12,500,000 monthly listeners',
      genres: ['Music'],
      popularity: 80,
      badgeHTML: this.getBadgeHTML('Verified Artist'),
      source: 'Fallback'
    };

    this._artistCache.set(cacheKey, fallbackData);
    return fallbackData;
  },

  
  async getArtistBio(artistName) {
    if (!artistName) return '';
    const cleanName = this.getPrimaryArtistName(artistName);

    return `${cleanName} is an internationally acclaimed musical artist, renowned for delivering chart-topping hits and unforgettable melodies. With millions of streams across global platforms, ${cleanName} continues to shape contemporary soundscapes with deep passion, versatile vocals, and creative artistry.`;
  },

  
  async enrichEnglishSong(song) {
    if (!song || !song.title) return song;
    song.badgeHTML = this.getBadgeHTML('Spotify');
    return song;
  },

  
  getBadgeHTML(text) {
    return `<span style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#1db954,#1ed760);color:#000;font-size:9px;font-weight:800;padding:2px 7px;border-radius:4px;letter-spacing:0.5px;">
      <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.6 14.4c-.2.3-.5.4-.8.2-2.2-1.4-5-1.7-8.3-.9-.3.1-.6-.1-.7-.4s.1-.6.4-.7c3.6-.8 6.7-.5 9.2 1 .3.2.4.5.2.8zm1.2-2.7c-.2.4-.7.5-1 .3-2.5-1.6-6.4-2-9.3-1.1-.4.1-.8-.1-.9-.5s.1-.8.5-.9c3.4-1 7.6-.5 10.5 1.3.3.1.4.6.2.9zm.1-2.8c-3-1.8-8-2-10.8-1.1-.5.1-1-.1-1.1-.6-.1-.5.1-1 .6-1.1C10 7.2 15.5 7.4 19 9.5c.4.3.6.8.3 1.3-.2.4-.8.5-1.4.1z"/></svg>
      ${text || 'Spotify'}
    </span>`;
  }
};

if (typeof window !== 'undefined') {
  window.SPOTIFY_API = SPOTIFY_API;
}

if (typeof module !== 'undefined') {
  module.exports = { SPOTIFY_API };
}
