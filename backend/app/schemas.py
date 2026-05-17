from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str

class SongCreate(BaseModel):
    title: str
    duration: str | None = None
    audio_url: str
    cover_url: str | None = None
    artist_name: str
    album_title: str | None = None


class SongResponse(BaseModel):
    id: int
    title: str
    duration: str | None = None
    audio_url: str
    cover_url: str | None = None
    artist_name: str | None = None
    album_title: str | None = None

    class Config:
        from_attributes = True

class PlaylistCreate(BaseModel):
    name: str


class PlaylistResponse(BaseModel):
    id: int
    name: str
    owner_id: int

    class Config:
        from_attributes = True

class PlaylistCreate(BaseModel):
    name: str


class PlaylistResponse(BaseModel):
    id: int
    name: str
    owner_id: int

    class Config:
        from_attributes = True