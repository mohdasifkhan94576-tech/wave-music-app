from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from ytmusicapi import YTMusic
import yt_dlp
import uvicorn
import requests as req_lib
import time
import os
import json
import re
from dotenv import load_dotenv
import tempfile

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "Content-Range", "Accept-Ranges"],
)

yt = YTMusic()

stream_url_cache = {}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Wave YouTube Backend"}

def _format_yt_results(results):
    formatted = []
    for r in results:
        if 'videoId' not in r:
            continue
        
        video_id = r['videoId']
        
        img_url = ""
        thumbs = r.get('thumbnails') or r.get('thumbnail')
        if thumbs:
            if isinstance(thumbs, list) and len(thumbs) > 0:
                best = thumbs[-1]
                if isinstance(best, dict):
                    img_url = best.get('url', '')
                elif isinstance(best, str):
                    img_url = best
            elif isinstance(thumbs, str):
                img_url = thumbs
        
        if img_url:
            img_url_hq = re.sub(r'w\d+-h\d+', 'w500-h500', img_url)
        else:
            img_url_hq = img_url
        
        if not img_url:
            img_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
            img_url_hq = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"

        artists = []
        for a in r.get('artists', []):
            if isinstance(a, dict):
                artists.append(a.get('name', ''))
            elif isinstance(a, str):
                artists.append(a)
        artist_str = ", ".join(artists) if artists else "Unknown"

        duration_secs = 0
        d = r.get('duration_seconds') or r.get('duration') or r.get('length')
        if isinstance(d, int):
            duration_secs = d
        elif isinstance(d, str) and ':' in d:
            parts = d.split(':')
            if len(parts) == 2:
                duration_secs = int(parts[0]) * 60 + int(parts[1])

        mins = duration_secs // 60
        secs = duration_secs % 60

        album_name = ''
        album = r.get('album')
        if isinstance(album, dict):
            album_name = album.get('name', '')
        elif isinstance(album, str):
            album_name = album

        formatted.append({
            "id": "yt_" + video_id,
            "videoId": video_id,
            "title": r.get('title', ''),
            "artist": artist_str,
            "album": album_name,
            "duration": f"{mins}:{secs:02d}",
            "secs": duration_secs,
            "img": img_url_hq,
            "thumb": img_url if img_url else img_url_hq,
            "audioUrl": "yt_stream_pending_" + video_id,
        })
    return formatted

@app.get("/search")
def search_songs(q: str, limit: int = 10):
    try:
        results = yt.search(q, filter="songs", limit=limit)
        return {"success": True, "data": _format_yt_results(results)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/trending")
def get_trending(limit: int = 10):
    try:
        results = yt.search("trending hits", filter="songs", limit=limit)
        return {"success": True, "data": _format_yt_results(results)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/home")
def get_home(limit: int = 10):
    try:
        results = yt.search("latest top songs", filter="songs", limit=limit)
        return {"success": True, "data": _format_yt_results(results)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/related/{video_id}")
def get_related(video_id: str, limit: int = 10):
    try:
        playlist = yt.get_watch_playlist(videoId=video_id, limit=limit)
        tracks = playlist.get('tracks', [])
        return {"success": True, "data": _format_yt_results(tracks)}
    except Exception as e:
        return {"success": False, "error": str(e)}

def _extract_stream_url(video_id):
    now = time.time()
    if video_id in stream_url_cache:
        cached = stream_url_cache[video_id]
        if now - cached['time'] < 1800:
            return cached['url']

    base_ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'http_headers': {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    }

   
    cookie_path = None
    cookie_content = os.getenv("YT_COOKIES")
    if cookie_content:
        cookie_path = os.path.join(tempfile.gettempdir(), "cookies.txt")
        with open(cookie_path, "w", encoding="utf-8") as f:
            f.write(cookie_content)
    elif os.path.exists("cookies.txt"):
        cookie_path = "cookies.txt"

    strategies = []
    
  
    if cookie_path:
        strategies.append({
            'cookiefile': cookie_path,
            'extractor_args': {'youtube': {'player_client': ['android', 'web']}}
        })
        
    
    strategies.extend([
      
        {'extractor_args': {'youtube': {'player_client': ['android', 'ios']}}},
       
        {'extractor_args': {'youtube': {'player_client': ['tv', 'mweb']}}},
       
        {'extractor_args': {'youtube': {'player_client': ['web']}}}
    ])

    last_error = None
    for strategy in strategies:
        ydl_opts = base_ydl_opts.copy()
        ydl_opts.update(strategy)
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(
                    f"https://www.youtube.com/watch?v={video_id}", download=False
                )
                url = info.get('url')
                if url:
                    stream_url_cache[video_id] = {'url': url, 'time': now}
                    return url
        except Exception as e:
            last_error = e
            continue
            
    raise Exception(f"All extraction strategies failed. Last error: {last_error}")

@app.get("/stream/{video_id}")
def get_stream(video_id: str):
    try:
        url = _extract_stream_url(video_id)
        return {"success": True, "url": url}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/audio/{video_id}")
def audio_proxy(video_id: str, request: Request):
    try:
        audio_url = _extract_stream_url(video_id)
    except Exception as e:
        return {"success": False, "error": str(e)}

    proxy_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    range_header = request.headers.get('range')
    if range_header:
        proxy_headers['Range'] = range_header

    r = req_lib.get(audio_url, headers=proxy_headers, stream=True, timeout=30)

    resp_headers = {
        'Accept-Ranges': 'bytes',
    }
    if 'Content-Length' in r.headers:
        resp_headers['Content-Length'] = r.headers['Content-Length']
    if 'Content-Range' in r.headers:
        resp_headers['Content-Range'] = r.headers['Content-Range']

    content_type = r.headers.get('Content-Type', 'audio/mp4')

    return StreamingResponse(
        r.iter_content(chunk_size=65536),
        status_code=r.status_code,
        headers=resp_headers,
        media_type=content_type,
    )


@app.get("/")
def serve_index():
    return FileResponse("index.html")

@app.get("/{filename}")
def serve_file(filename: str):
    allowed_files = {"app.js", "style.css", "youtube.js", "jiosaavn.js", "sw.js", "manifest.json"}
    if filename in allowed_files:
        return FileResponse(filename)
    
    return FileResponse("index.html")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting Wave Music Backend Server on port {port}...")
    print("Endpoints: /, /health, /search, /stream/{id}, /audio/{id}")
    uvicorn.run(app, host="0.0.0.0", port=port)