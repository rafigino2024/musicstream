from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Song, Artist, Album, User
from ..schemas import SongCreate
from ..auth import get_current_user


router = APIRouter(
    prefix="/songs",
    tags=["Songs"]
)


def song_to_response(song: Song):
    return {
        "id": song.id,
        "title": song.title,
        "duration": song.duration,
        "audio_url": song.audio_url,
        "cover_url": song.cover_url,
        "artist_name": song.artist.name if song.artist else None,
        "album_title": song.album.title if song.album else None,
    }


@router.get("/")
def get_songs(db: Session = Depends(get_db)):
    songs = db.query(Song).all()
    return [song_to_response(song) for song in songs]


@router.get("/liked/me")
def get_liked_songs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()

    return [song_to_response(song) for song in user.liked]


@router.get("/{song_id}")
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id).first()

    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )

    return song_to_response(song)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_song(song_data: SongCreate, db: Session = Depends(get_db)):
    artist = db.query(Artist).filter(
        Artist.name == song_data.artist_name
    ).first()

    if not artist:
        artist = Artist(name=song_data.artist_name)
        db.add(artist)
        db.commit()
        db.refresh(artist)

    album = None

    if song_data.album_title:
        album = db.query(Album).filter(
            Album.title == song_data.album_title
        ).first()

        if not album:
            album = Album(
                title=song_data.album_title,
                cover_url=song_data.cover_url
            )
            db.add(album)
            db.commit()
            db.refresh(album)

    new_song = Song(
        title=song_data.title,
        duration=song_data.duration,
        audio_url=song_data.audio_url,
        cover_url=song_data.cover_url,
        artist_id=artist.id,
        album_id=album.id if album else None
    )

    db.add(new_song)
    db.commit()
    db.refresh(new_song)

    return song_to_response(new_song)


@router.post("/{song_id}/like")
def like_song(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    song = db.query(Song).filter(Song.id == song_id).first()

    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )

    user = db.query(User).filter(User.id == current_user.id).first()

    if song not in user.liked:
        user.liked.append(song)
        db.commit()

    return {
        "message": "Song liked",
        "song_id": song_id
    }


@router.delete("/{song_id}/like")
def unlike_song(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    song = db.query(Song).filter(Song.id == song_id).first()

    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )

    user = db.query(User).filter(User.id == current_user.id).first()

    if song in user.liked:
        user.liked.remove(song)
        db.commit()

    return {
        "message": "Song unliked",
        "song_id": song_id
    }