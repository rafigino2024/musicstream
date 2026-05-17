from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Playlist, Song, User
from ..schemas import PlaylistCreate
from ..auth import get_current_user


router = APIRouter(
    prefix="/playlists",
    tags=["Playlists"]
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


def playlist_to_response(playlist: Playlist):
    return {
        "id": playlist.id,
        "name": playlist.name,
        "owner_id": playlist.owner_id,
        "songs": [song_to_response(song) for song in playlist.songs],
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_playlist(
    playlist_data: PlaylistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    playlist = Playlist(
        name=playlist_data.name,
        owner_id=current_user.id
    )

    db.add(playlist)
    db.commit()
    db.refresh(playlist)

    return playlist_to_response(playlist)


@router.get("/")
def get_my_playlists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    playlists = db.query(Playlist).filter(
        Playlist.owner_id == current_user.id
    ).all()

    return [playlist_to_response(playlist) for playlist in playlists]


@router.get("/{playlist_id}")
def get_playlist(
    playlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.owner_id == current_user.id
    ).first()

    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )

    return playlist_to_response(playlist)


@router.post("/{playlist_id}/songs/{song_id}")
def add_song_to_playlist(
    playlist_id: int,
    song_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.owner_id == current_user.id
    ).first()

    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )

    song = db.query(Song).filter(Song.id == song_id).first()

    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )

    if song not in playlist.songs:
        playlist.songs.append(song)
        db.commit()

    return playlist_to_response(playlist)


@router.delete("/{playlist_id}/songs/{song_id}")
def remove_song_from_playlist(
    playlist_id: int,
    song_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.owner_id == current_user.id
    ).first()

    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )

    song = db.query(Song).filter(Song.id == song_id).first()

    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )

    if song in playlist.songs:
        playlist.songs.remove(song)
        db.commit()

    return playlist_to_response(playlist)


@router.delete("/{playlist_id}")
def delete_playlist(
    playlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.owner_id == current_user.id
    ).first()

    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )

    db.delete(playlist)
    db.commit()

    return {
        "message": "Playlist deleted",
        "playlist_id": playlist_id
    }
