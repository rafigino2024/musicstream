# 🎵 MusicStream

MusicStream is a full-stack music streaming web app inspired by Spotify.  
The project includes a React frontend, a Python FastAPI backend, user authentication, songs, search, liked songs, playlists, and a working audio player.

---

## 🚀 Features

### User Features

- Register new users
- Login with email and password
- JWT authentication
- Stay logged in with localStorage
- Logout
- View current logged-in user

### Music Features

- Display songs from the backend
- Play / pause songs
- Next / previous song controls
- Progress bar
- Seek inside a song
- Current time and song duration
- Volume control
- Auto-play next song when current song ends

### Search Features

- Search songs by title
- Search songs by artist
- Search songs by album

### Liked Songs

- Like songs
- Unlike songs
- Save liked songs per logged-in user
- View only liked songs

### Playlists

- Create playlists
- View user playlists
- Open playlist
- Add songs to playlist
- Remove songs from playlist
- Delete playlist
- Play songs from playlist

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Axios
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT authentication
- Passlib + bcrypt

---

## 📁 Project Structure

```text
musicstream
│
├── backend
│   ├── app
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── routes
│   │   │   ├── __init__.py
│   │   │   ├── auth_routes.py
│   │   │   ├── song_routes.py
│   │   │   └── playlist_routes.py
│   │   └── uploads
│   │       ├── songs
│   │       └── covers
│   │
│   ├── musicstream.db
│   ├── requirements.txt
│   ├── run.py
│   └── seed.py
│
└── frontend
    ├── src
    │   ├── api
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    │
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Backend Setup

Open a terminal inside the backend folder:

```bash
cd "C:\New folder-projects\musicstream\backend"
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

If you do not have a `requirements.txt` yet, install manually:

```bash
pip install fastapi uvicorn sqlalchemy pydantic "pydantic[email]" python-multipart passlib==1.7.4 bcrypt==4.0.1 python-jose
```

Then save dependencies:

```bash
pip freeze > requirements.txt
```

Run the backend server:

```bash
python run.py
```

Backend should run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 💻 Frontend Setup

Open a second terminal inside the frontend folder:

```bash
cd "C:\New folder-projects\musicstream\frontend"
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend should run at:

```text
http://localhost:5173
```

---

## 🔐 Authentication API

### Register

```http
POST /auth/register
```

Example body:

```json
{
  "username": "rafi",
  "email": "rafi@test.com",
  "password": "123456"
}
```

### Login

```http
POST /auth/login
```

Example body:

```json
{
  "email": "rafi@test.com",
  "password": "123456"
}
```

Example response:

```json
{
  "access_token": "JWT_TOKEN_HERE",
  "token_type": "bearer"
}
```

### Get Current User

```http
GET /auth/me
```

Requires Authorization header:

```text
Authorization: Bearer JWT_TOKEN_HERE
```

---

## 🎶 Songs API

### Get All Songs

```http
GET /songs/
```

### Get One Song

```http
GET /songs/{song_id}
```

### Create Song

```http
POST /songs/
```

Example body:

```json
{
  "title": "Night Drive",
  "duration": "4:12",
  "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "cover_url": "https://picsum.photos/300/300?random=2",
  "artist_name": "Neon Wave",
  "album_title": "City Lights"
}
```

---

## ❤️ Liked Songs API

### Get My Liked Songs

```http
GET /songs/liked/me
```

### Like Song

```http
POST /songs/{song_id}/like
```

### Unlike Song

```http
DELETE /songs/{song_id}/like
```

These routes require the user to be logged in.

---

## 📚 Playlists API

### Create Playlist

```http
POST /playlists/
```

Example body:

```json
{
  "name": "My Favorites"
}
```

### Get My Playlists

```http
GET /playlists/
```

### Get One Playlist

```http
GET /playlists/{playlist_id}
```

### Add Song to Playlist

```http
POST /playlists/{playlist_id}/songs/{song_id}
```

### Remove Song from Playlist

```http
DELETE /playlists/{playlist_id}/songs/{song_id}
```

### Delete Playlist

```http
DELETE /playlists/{playlist_id}
```

These routes require the user to be logged in.

---

## 🌱 Seed Demo Songs

The project can include a `seed.py` file to insert demo songs automatically.

Run it from the backend folder:

```bash
python seed.py
```

Then check songs at:

```text
http://127.0.0.1:8000/songs/
```

---

## 🧪 How to Test the App

1. Start the backend:

```bash
cd "C:\New folder-projects\musicstream\backend"
venv\Scripts\activate
python run.py
```

2. Start the frontend:

```bash
cd "C:\New folder-projects\musicstream\frontend"
npm run dev
```

3. Open the app:

```text
http://localhost:5173
```

4. Register a new user.
5. Login.
6. Add songs through Swagger or seed script.
7. Play songs.
8. Like songs.
9. Create playlists.
10. Add songs to playlists.

---

## ⚠️ Common Problems and Fixes

### 401 Unauthorized on playlists or liked songs

This usually means the frontend did not send the JWT token.

Check `frontend/src/api/api.js`:

```javascript
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("musicstream_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

Then logout and login again.

---

### bcrypt error

If you see bcrypt/passlib errors, install the stable versions:

```bash
pip uninstall bcrypt passlib -y
pip install passlib==1.7.4 bcrypt==4.0.1
```

---

### Static files error

If you see:

```text
RuntimeError: Directory 'app/uploads' does not exist
```

Create these folders:

```bash
mkdir app\uploads
mkdir app\uploads\songs
mkdir app\uploads\covers
```

---

## 🔮 Future Improvements

Planned next steps:

- Split React code into components
- Add upload song feature
- Add admin dashboard
- Add album pages
- Add artist pages
- Add mobile responsive design
- Add dark/light theme
- Add real file storage
- Add PostgreSQL support
- Add deployment instructions

---

## 👨‍💻 Author

Built by Rafi Gino as a full-stack learning project.

---

## 📌 Project Status

Current status: In development.

Completed:

- Backend setup
- Database models
- Authentication
- Songs API
- Music player
- Search
- Liked songs
- Playlis