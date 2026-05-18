import { useEffect, useRef, useState } from "react";
import API from "./api/api";
import "./index.css";

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function App() {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [likedSongs, setLikedSongs] = useState([]);
const [viewMode, setViewMode] = useState("home");
const [playlists, setPlaylists] = useState([]);
const [selectedPlaylist, setSelectedPlaylist] = useState(null);
const [newPlaylistName, setNewPlaylistName] = useState("");
const [showPlaylistBox, setShowPlaylistBox] = useState(false);

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const [authMode, setAuthMode] = useState(null); // null | "login" | "register"
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const audioRef = useRef(null);

  useEffect(() => {
    fetchSongs();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, currentSong]);

  async function fetchSongs() {
    try {
      const response = await API.get("/songs/");
      setSongs(response.data);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  }

  async function fetchCurrentUser() {
    const token = localStorage.getItem("musicstream_token");

    if (!token) return;

    try {
      const response = await API.get("/auth/me");
      setUser(response.data);
      await fetchLikedSongs();
      await fetchPlaylists();
    } catch (error) {
      localStorage.removeItem("musicstream_token");
      setUser(null);
      
    }
  }
  async function fetchLikedSongs() {
  try {
    const response = await API.get("/songs/liked/me");
    setLikedSongs(response.data);
  } catch (error) {
    setLikedSongs([]);
  }
}
async function fetchPlaylists() {
  try {
    const response = await API.get("/playlists/");
    setPlaylists(response.data);
  } catch (error) {
    setPlaylists([]);
  }
}


async function createPlaylist(event) {
  event.preventDefault();

  if (!user) {
    setAuthMode("login");
    return;
  }

  if (!newPlaylistName.trim()) {
    alert("Please enter playlist name");
    return;
  }

  try {
    const response = await API.post("/playlists/", {
      name: newPlaylistName.trim(),
    });

    console.log("Playlist created:", response.data);

    setPlaylists((prev) => [...prev, response.data]);
    setNewPlaylistName("");
    setShowPlaylistBox(false);
    setViewMode("library");
  } catch (error) {
    console.error("Error creating playlist:", error);

    alert(
      error.response?.data?.detail ||
        error.message ||
        "Error creating playlist"
    );
  }
}


async function openPlaylist(playlist) {
  try {
    const response = await API.get(`/playlists/${playlist.id}`);
    setSelectedPlaylist(response.data);
    setViewMode("playlist");
  } catch (error) {
    console.error("Error opening playlist:", error);
  }
}


async function addSongToPlaylist(song, playlistId) {
  if (!user) {
    setAuthMode("login");
    return;
  }

  try {
    const response = await API.post(
      `/playlists/${playlistId}/songs/${song.id}`
    );

    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId ? response.data : playlist
      )
    );

    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(response.data);
    }
  } catch (error) {
    console.error("Error adding song to playlist:", error);
  }
}


async function removeSongFromPlaylist(event, song) {
  event.stopPropagation();

  if (!selectedPlaylist) return;

  try {
    const response = await API.delete(
      `/playlists/${selectedPlaylist.id}/songs/${song.id}`
    );

    setSelectedPlaylist(response.data);

    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === selectedPlaylist.id ? response.data : playlist
      )
    );
  } catch (error) {
    console.error("Error removing song from playlist:", error);
  }
}


async function deletePlaylist() {
  if (!selectedPlaylist) return;

  try {
    await API.delete(`/playlists/${selectedPlaylist.id}`);

    setPlaylists((prev) =>
      prev.filter((playlist) => playlist.id !== selectedPlaylist.id)
    );

    setSelectedPlaylist(null);
    setViewMode("home");
  } catch (error) {
    console.error("Error deleting playlist:", error);
  }
}

  async function handleRegister(event) {
  event.preventDefault();
  setAuthError("");

  try {
    await API.post("/auth/register", registerForm);

    const loginResponse = await API.post("/auth/login", {
      email: registerForm.email,
      password: registerForm.password,
    });

    console.log("REGISTER LOGIN RESPONSE:", loginResponse.data);

    const token = loginResponse.data.access_token;

    if (!token) {
      throw new Error("No token received from server");
    }

    localStorage.setItem("musicstream_token", token);

    const meResponse = await API.get("/auth/me");
    setUser(meResponse.data);

    await fetchLikedSongs();
    await fetchPlaylists();

    setRegisterForm({
      username: "",
      email: "",
      password: "",
    });

    setAuthMode(null);
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    setAuthError(
      error.response?.data?.detail || error.message || "Register failed"
    );
  }
}

  async function handleLogin(event) {
  event.preventDefault();
  setAuthError("");

  try {
    const response = await API.post("/auth/login", loginForm);

    console.log("LOGIN RESPONSE:", response.data);

    const token = response.data.access_token;

    if (!token) {
      throw new Error("No token received from server");
    }

    localStorage.setItem("musicstream_token", token);

    const meResponse = await API.get("/auth/me");
    setUser(meResponse.data);

    await fetchLikedSongs();
    await fetchPlaylists();

    setLoginForm({
      email: "",
      password: "",
    });

    setAuthMode(null);
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    setAuthError(
      error.response?.data?.detail || error.message || "Login failed"
    );
  }
}

 function logout() {
  localStorage.removeItem("musicstream_token");
  setUser(null);
  setLikedSongs([]);
  setPlaylists([]);
  setSelectedPlaylist(null);
  setViewMode("home");
  setAuthMode(null);
}
function isSongLiked(songId) {
  return likedSongs.some((song) => song.id === songId);
}


async function toggleLike(event, song) {
  event.stopPropagation();

  if (!user) {
    setAuthMode("login");
    return;
  }

  try {
    if (isSongLiked(song.id)) {
      await API.delete(`/songs/${song.id}/like`);
      setLikedSongs((prev) =>
        prev.filter((likedSong) => likedSong.id !== song.id)
      );
    } else {
      await API.post(`/songs/${song.id}/like`);
      setLikedSongs((prev) => [...prev, song]);
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }
}

  function selectSong(song) {
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
    setAudioDuration(0);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.play();
      }
    }, 100);
  }

  function togglePlay() {
    if (!currentSong || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function playNext() {
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;

    selectSong(songs[nextIndex]);
  }

  function playPrevious() {
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    const previousIndex =
      currentIndex === 0 ? songs.length - 1 : currentIndex - 1;

    selectSong(songs[previousIndex]);
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  }

  function handleLoadedMetadata() {
    if (!audioRef.current) return;
    setAudioDuration(audioRef.current.duration);
  }

  function handleProgressChange(event) {
    if (!audioRef.current) return;

    const newTime = Number(event.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }

  function handleVolumeChange(event) {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }
  const visibleSongs =
  viewMode === "liked"
    ? likedSongs
    : viewMode === "playlist" && selectedPlaylist
    ? selectedPlaylist.songs
    : songs;

  const filteredSongs = visibleSongs.filter((song) => {
    const title = song.title?.toLowerCase() || "";
    const artist = song.artist_name?.toLowerCase() || "";
    const album = song.album_title?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      title.includes(search) ||
      artist.includes(search) ||
      album.includes(search)
    );
  });

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>MusicStream</h1>

       <nav>
  <button
    className={viewMode === "home" ? "nav-active" : ""}
    onClick={() => setViewMode("home")}
  >
    Home
  </button>

  <button
    onClick={() => {
      setViewMode("home");
      setTimeout(() => {
        document.querySelector(".topbar input")?.focus();
      }, 50);
    }}
  >
    Search
  </button>

 <button
  className={viewMode === "library" ? "nav-active" : ""}
  onClick={() => {
    if (!user) {
      setAuthMode("login");
      return;
    }

    setViewMode("library");
    fetchPlaylists();
  }}
>
  Library
</button>

  <button
    className={viewMode === "liked" ? "nav-active" : ""}
    onClick={() => {
      if (!user) {
        setAuthMode("login");
        return;
      }

      setViewMode("liked");
      fetchLikedSongs();
      async function fetchPlaylists() {
  try {
    const response = await API.get("/playlists/");
    setPlaylists(response.data);
  } catch (error) {
    setPlaylists([]);
  }
}


async function createPlaylist(event) {
  event.preventDefault();

  if (!user) {
    setAuthMode("login");
    return;
  }

  if (!newPlaylistName.trim()) return;

  try {
    const response = await API.post("/playlists/", {
      name: newPlaylistName,
    });

    setPlaylists((prev) => [...prev, response.data]);
    setNewPlaylistName("");
    setShowPlaylistBox(false);
  } catch (error) {
    console.error("Error creating playlist:", error);
  }
}


async function openPlaylist(playlist) {
  try {
    const response = await API.get(`/playlists/${playlist.id}`);
    setSelectedPlaylist(response.data);
    setViewMode("playlist");
  } catch (error) {
    console.error("Error opening playlist:", error);
  }
}


async function addSongToPlaylist(song, playlistId) {
  if (!user) {
    setAuthMode("login");
    return;
  }

  try {
    const response = await API.post(
      `/playlists/${playlistId}/songs/${song.id}`
    );

    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId ? response.data : playlist
      )
    );

    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(response.data);
    }
  } catch (error) {
    console.error("Error adding song to playlist:", error);
  }
}


async function removeSongFromPlaylist(event, song) {
  event.stopPropagation();

  if (!selectedPlaylist) return;

  try {
    const response = await API.delete(
      `/playlists/${selectedPlaylist.id}/songs/${song.id}`
    );

    setSelectedPlaylist(response.data);

    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === selectedPlaylist.id ? response.data : playlist
      )
    );
  } catch (error) {
    console.error("Error removing song from playlist:", error);
  }
}


async function deletePlaylist() {
  if (!selectedPlaylist) return;

  try {
    await API.delete(`/playlists/${selectedPlaylist.id}`);

    setPlaylists((prev) =>
      prev.filter((playlist) => playlist.id !== selectedPlaylist.id)
    );

    setSelectedPlaylist(null);
    setViewMode("home");
  } catch (error) {
    console.error("Error deleting playlist:", error);
  }
}
    }}
  >
    Liked Songs
  </button>
</nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <input
            placeholder="Search songs, artists, albums..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <div className="auth-area">
            {user ? (
              <>
                <span className="user-badge">Hi, {user.username}</span>
                <button onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => setAuthMode("login")}>Login</button>
                <button onClick={() => setAuthMode("register")}>
                  Register
                </button>
              </>
            )}
          </div>
        </header>

        {authMode && (
          <div className="auth-modal">
            <div className="auth-box">
              <button className="close-button" onClick={() => setAuthMode(null)}>
                ✕
              </button>

              {authMode === "login" && (
                <>
                  <h2>Login</h2>

                  <form onSubmit={handleLogin}>
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm({
                          ...loginForm,
                          email: event.target.value,
                        })
                      }
                      required
                    />

                    <input
                      type="password"
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm({
                          ...loginForm,
                          password: event.target.value,
                        })
                      }
                      required
                    />

                    {authError && <p className="auth-error">{authError}</p>}

                    <button type="submit">Login</button>
                  </form>

                  <p className="switch-auth">
                    Don't have an account?{" "}
                    <button onClick={() => setAuthMode("register")}>
                      Register
                    </button>
                  </p>
                </>
              )}

              {authMode === "register" && (
                <>
                  <h2>Create account</h2>

                  <form onSubmit={handleRegister}>
                    <input
                      type="text"
                      placeholder="Username"
                      value={registerForm.username}
                      onChange={(event) =>
                        setRegisterForm({
                          ...registerForm,
                          username: event.target.value,
                        })
                      }
                      required
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={registerForm.email}
                      onChange={(event) =>
                        setRegisterForm({
                          ...registerForm,
                          email: event.target.value,
                        })
                      }
                      required
                    />

                    <input
                      type="password"
                      placeholder="Password"
                      value={registerForm.password}
                      onChange={(event) =>
                        setRegisterForm({
                          ...registerForm,
                          password: event.target.value,
                        })
                      }
                      required
                    />

                    {authError && <p className="auth-error">{authError}</p>}

                    <button type="submit">Register</button>
                  </form>

                  <p className="switch-auth">
                    Already have an account?{" "}
                    <button onClick={() => setAuthMode("login")}>
                      Login
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        <section>
          {viewMode === "library" && (
  <div className="library-panel">
    <div className="section-title-row">
      <h2>Your Library</h2>

      <button onClick={() => setShowPlaylistBox(!showPlaylistBox)}>
        + New Playlist
      </button>
    </div>

    {showPlaylistBox && (
      <form className="playlist-form" onSubmit={createPlaylist}>
        <input
          placeholder="Playlist name"
          value={newPlaylistName}
          onChange={(event) => setNewPlaylistName(event.target.value)}
        />

        <button type="submit">Create</button>
      </form>
    )}

    {playlists.length === 0 ? (
      <p className="empty-message">No playlists yet.</p>
    ) : (
      <div className="playlist-grid">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="playlist-card"
            onClick={() => openPlaylist(playlist)}
          >
            <div className="playlist-cover">♫</div>
            <h3>{playlist.name}</h3>
            <p>{playlist.songs.length} songs</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}{viewMode !== "library" && (
  <>
    <h2>
      {viewMode === "liked"
        ? "Liked Songs"
        : viewMode === "playlist" && selectedPlaylist
        ? selectedPlaylist.name
        : searchTerm
        ? "Search results"
        : "Good evening"}
    </h2>

    {viewMode === "playlist" && selectedPlaylist && (
      <button className="delete-playlist-button" onClick={deletePlaylist}>
        Delete Playlist
      </button>
    )}

    {filteredSongs.length === 0 ? (
      <p className="empty-message">No songs found.</p>
    ) : (
      <div className="grid">
        {filteredSongs.map((song) => (
          <div
            className={`song-card ${
              currentSong?.id === song.id ? "active-song" : ""
            }`}
            key={song.id}
            onClick={() => selectSong(song)}
          >
            <img
              src={song.cover_url || "https://picsum.photos/300/300"}
              alt={song.title}
            />

            <button
              className={`like-button ${isSongLiked(song.id) ? "liked" : ""}`}
              onClick={(event) => toggleLike(event, song)}
            >
              {isSongLiked(song.id) ? "♥" : "♡"}
            </button>

            {viewMode === "playlist" && (
              <button
                className="remove-song-button"
                onClick={(event) => removeSongFromPlaylist(event, song)}
              >
                Remove
              </button>
            )}

            {viewMode !== "playlist" && playlists.length > 0 && user && (
              <select
                className="playlist-select"
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const playlistId = Number(event.target.value);

                  if (playlistId) {
                    addSongToPlaylist(song, playlistId);
                    event.target.value = "";
                  }
                }}
              >
                <option value="">+ Playlist</option>

                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
            )}

            <h3>{song.title}</h3>
            <p>{song.artist_name}</p>
            <span>{song.duration}</span>
          </div>
        ))}
      </div>
    )}
  </>
)}

          {filteredSongs.length === 0 ? (
            <p className="empty-message">No songs found.</p>
          ) : (
            <div className="grid">
              {filteredSongs.map((song) => (
                <div
                  className={`song-card ${
                    currentSong?.id === song.id ? "active-song" : ""
                  }`}
                  key={song.id}
                  onClick={() => selectSong(song)}
                >
                  <img
  src={song.cover_url || "https://picsum.photos/300/300"}
  alt={song.title}
/>
                 <button
  className={`like-button ${isSongLiked(song.id) ? "liked" : ""}`}
  onClick={(event) => toggleLike(event, song)}
>
  {isSongLiked(song.id) ? "♥" : "♡"}
</button>

                  <h3>{song.title}</h3>
                  <p>{song.artist_name}</p>
                  <span>{song.duration}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="player">
        <div className="player-song">
          {currentSong ? (
            <>
              <img
                src={currentSong.cover_url || "https://picsum.photos/80/80"}
                alt={currentSong.title}
              />

              <div>
                <strong>{currentSong.title}</strong>
                <p>{currentSong.artist_name}</p>
              </div>
            </>
          ) : (
            <div>
              <strong>No song playing</strong>
              <p>Select a song</p>
            </div>
          )}
        </div>

        <div className="player-center">
          <div className="controls">
            <button onClick={playPrevious}>⏮</button>

            <button className="play-button" onClick={togglePlay}>
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button onClick={playNext}>⏭</button>
          </div>

          <div className="progress-row">
            <span>{formatTime(currentTime)}</span>

            <input
              type="range"
              min="0"
              max={audioDuration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              className="progress-bar"
            />

            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>

        <div className="volume-control">
          <span>🔊</span>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>

        {currentSong && (
          <audio
            ref={audioRef}
            src={currentSong.audio_url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={playNext}
          />
        )}
      </footer>
    </div>
  );
}

export default App;