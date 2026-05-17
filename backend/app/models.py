from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base


playlist_songs = Table(
    "playlist_songs",
    Base.metadata,
    Column("playlist_id", Integer, ForeignKey("playlists.id")),
    Column("song_id", Integer, ForeignKey("songs.id"))
)


liked_songs = Table(
    "liked_songs",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("song_id", Integer, ForeignKey("songs.id"))
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    playlists = relationship("Playlist", back_populates="owner")
    liked = relationship("Song", secondary=liked_songs, back_populates="liked_by")


class Artist(Base):
    __tablename__ = "artists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    songs = relationship("Song", back_populates="artist")


class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    cover_url = Column(String, nullable=True)

    songs = relationship("Song", back_populates="album")


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    duration = Column(String, nullable=True)

    audio_url = Column(String, nullable=False)
    cover_url = Column(String, nullable=True)

    artist_id = Column(Integer, ForeignKey("artists.id"))
    album_id = Column(Integer, ForeignKey("albums.id"))

    artist = relationship("Artist", back_populates="songs")
    album = relationship("Album", back_populates="songs")

    liked_by = relationship("User", secondary=liked_songs, back_populates="liked")


class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="playlists")
    songs = relationship("Song", secondary=playlist_songs)