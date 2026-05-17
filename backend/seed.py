from app.database import SessionLocal
from app.models import Artist, Album, Song


demo_songs = [
    {
        "title": "First Demo Song",
        "duration": "3:45",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "cover_url": "https://picsum.photos/300/300?random=1",
        "artist_name": "Demo Artist",
        "album_title": "Demo Album",
    },
    {
        "title": "Night Drive",
        "duration": "4:12",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "cover_url": "https://picsum.photos/300/300?random=2",
        "artist_name": "Neon Wave",
        "album_title": "City Lights",
    },
    {
        "title": "Morning Chill",
        "duration": "2:58",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "cover_url": "https://picsum.photos/300/300?random=3",
        "artist_name": "Soft Beats",
        "album_title": "Relax Mode",
    },
    {
        "title": "Deep Focus",
        "duration": "5:01",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "cover_url": "https://picsum.photos/300/300?random=4",
        "artist_name": "LoFi Studio",
        "album_title": "Coding Flow",
    },
    {
        "title": "Weekend Energy",
        "duration": "3:32",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        "cover_url": "https://picsum.photos/300/300?random=5",
        "artist_name": "Beat Runner",
        "album_title": "Workout Mix",
    },
]


def get_or_create_artist(db, artist_name):
    artist = db.query(Artist).filter(Artist.name == artist_name).first()

    if artist:
        return artist

    artist = Artist(name=artist_name)
    db.add(artist)
    db.commit()
    db.refresh(artist)

    return artist


def get_or_create_album(db, album_title, cover_url):
    album = db.query(Album).filter(Album.title == album_title).first()

    if album:
        return album

    album = Album(
        title=album_title,
        cover_url=cover_url,
    )

    db.add(album)
    db.commit()
    db.refresh(album)

    return album


def seed_songs():
    db = SessionLocal()

    try:
        for item in demo_songs:
            existing_song = db.query(Song).filter(
                Song.title == item["title"]
            ).first()

            if existing_song:
                print(f"Song already exists: {item['title']}")
                continue

            artist = get_or_create_artist(db, item["artist_name"])
            album = get_or_create_album(
                db,
                item["album_title"],
                item["cover_url"]
            )

            song = Song(
                title=item["title"],
                duration=item["duration"],
                audio_url=item["audio_url"],
                cover_url=item["cover_url"],
                artist_id=artist.id,
                album_id=album.id,
            )

            db.add(song)
            db.commit()

            print(f"Added song: {item['title']}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_songs()