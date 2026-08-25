'use strict';

(function() {
  const DB_NAME = 'WaveMusicDB';
  const DB_VERSION = 1;

  let dbInstance = null;
  let isInitialized = false;

  const STORES = {
    SONGS: 'songs',
    USER_DATA: 'userData',
    HISTORY: 'history',
    OFFLINE_AUDIO: 'offlineAudio'
  };

  const WaveDB = {
    async init() {
      if (isInitialized && dbInstance) return dbInstance;

      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          console.warn('[WaveDB] IndexedDB is not supported on this browser. Falling back to memory storage.');
          resolve(null);
          return;
          
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

  
          if (!db.objectStoreNames.contains(STORES.SONGS)) {
            const songStore = db.createObjectStore(STORES.SONGS, { keyPath: 'id' });
            songStore.createIndex('title', 'title', { unique: false });
            songStore.createIndex('artist', 'artist', { unique: false });
            songStore.createIndex('cachedAt', 'cachedAt', { unique: false });
          }

    
          if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
            db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
          }

          if (!db.objectStoreNames.contains(STORES.HISTORY)) {
            const histStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
            histStore.createIndex('timestamp', 'timestamp', { unique: false });
            histStore.createIndex('songId', 'songId', { unique: false });
          }

          if (!db.objectStoreNames.contains(STORES.OFFLINE_AUDIO)) {
            db.createObjectStore(STORES.OFFLINE_AUDIO, { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          dbInstance = event.target.result;
          isInitialized = true;
          console.log('[WaveDB] IndexedDB initialized successfully.');
          resolve(dbInstance);
        };

        request.onerror = (event) => {
          console.error('[WaveDB] Error opening IndexedDB:', event.target.error);
          resolve(null); 
        };
      });
    },

   
    _getStore(storeName, mode = 'readonly') {
      if (!dbInstance) return null;
      try {
        const tx = dbInstance.transaction(storeName, mode);
        return tx.objectStore(storeName);
      } catch (err) {
        console.warn(`[WaveDB] Transaction error for store "${storeName}":`, err);
        return null;
      }
    },

    async put(storeName, value) {
      if (!dbInstance) await this.init();
      const store = this._getStore(storeName, 'readwrite');
      if (!store) return false;

      return new Promise((resolve) => {
        try {
          const req = store.put(value);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    },

    async get(storeName, key) {
      if (!dbInstance) await this.init();
      const store = this._getStore(storeName, 'readonly');
      if (!store) return null;

      return new Promise((resolve) => {
        try {
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    },

    async getAll(storeName, limit = null) {
      if (!dbInstance) await this.init();
      const store = this._getStore(storeName, 'readonly');
      if (!store) return [];

      return new Promise((resolve) => {
        try {
          const req = limit ? store.getAll(null, limit) : store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (e) {
          resolve([]);
        }
      });
    },

  
    async delete(storeName, key) {
      if (!dbInstance) await this.init();
      const store = this._getStore(storeName, 'readwrite');
      if (!store) return false;

      return new Promise((resolve) => {
        try {
          const req = store.delete(key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    },

  
    async saveSong(song) {
      if (!song || !song.id) return;
      const cleanSong = {
        id: String(song.id),
        title: song.title || '',
        artist: song.artist || song.singers || 'Unknown Artist',
        album: song.album || '',
        thumb: song.thumb || song.img || '',
        img: song.img || song.thumb || '',
        audioUrl: song.audioUrl || song.url || '',
        duration: song.duration || '0:00',
        tags: Array.isArray(song.tags) ? song.tags : [],
        isCloud: !!song.isCloud,
        cachedAt: Date.now()
      };
      return this.put(STORES.SONGS, cleanSong);
    },

  
    async saveSongsBulk(songs) {
      if (!Array.isArray(songs) || songs.length === 0) return;
      if (!dbInstance) await this.init();
      const store = this._getStore(STORES.SONGS, 'readwrite');
      if (!store) return;

      for (const song of songs) {
        if (song && song.id) {
          try {
            store.put({
              id: String(song.id),
              title: song.title || '',
              artist: song.artist || song.singers || 'Unknown Artist',
              album: song.album || '',
              thumb: song.thumb || song.img || '',
              img: song.img || song.thumb || '',
              audioUrl: song.audioUrl || song.url || '',
              duration: song.duration || '0:00',
              tags: Array.isArray(song.tags) ? song.tags : [],
              isCloud: !!song.isCloud,
              cachedAt: Date.now()
            });
          } catch (e) {}
        }
      }
    },

  
    async getAllSongs() {
      return this.getAll(STORES.SONGS);
    },

    
    async setUserData(key, value) {
      return this.put(STORES.USER_DATA, { key, value, updatedAt: Date.now() });
    },

   
    async getUserData(key, defaultValue = null) {
      const record = await this.get(STORES.USER_DATA, key);
      return record && record.value !== undefined ? record.value : defaultValue;
    },

 
    async migrateFromLocalStorage() {
      try {
        const isMigrated = localStorage.getItem('wave_db_migrated_v1');
        if (isMigrated === 'true') return;

        console.log('[WaveDB] Migrating user data from LocalStorage to IndexedDB...');

     
        const liked = localStorage.getItem('wave_liked_songs');
        if (liked) {
          try { await this.setUserData('likedSongs', JSON.parse(liked)); } catch(e) {}
        }

       
        const playlists = localStorage.getItem('wave_user_playlists');
        if (playlists) {
          try { await this.setUserData('userPlaylists', JSON.parse(playlists)); } catch(e) {}
        }

       
        const artists = localStorage.getItem('wave_followed_artists');
        if (artists) {
          try { await this.setUserData('followedArtists', JSON.parse(artists)); } catch(e) {}
        }

      
        const savedJio = localStorage.getItem('wave_saved_jiosaavn');
        if (savedJio) {
          try {
            const jioSongs = JSON.parse(savedJio);
            if (Array.isArray(jioSongs)) {
              await this.saveSongsBulk(jioSongs);
            }
          } catch(e) {}
        }

      
        const hist = localStorage.getItem('wave_play_history_v1');
        if (hist) {
          try { await this.setUserData('historyLogs', JSON.parse(hist)); } catch(e) {}
        }

        
        const counts = localStorage.getItem('wave_song_play_counts_v1');
        if (counts) {
          try { await this.setUserData('playCounts', JSON.parse(counts)); } catch(e) {}
        }

        localStorage.setItem('wave_db_migrated_v1', 'true');
        console.log('[WaveDB] Migration from LocalStorage completed successfully.');
      } catch (err) {
        console.warn('[WaveDB] Migration warning:', err);
      }
    }
  };

 
  window.WaveDB = WaveDB;
})();
