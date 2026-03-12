import hashlib
import hmac
from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SECRET_KEY = "brand-guardian-dev-secret-change-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# ---------------------------------------------------------------------------
# In-memory store  {username: hashed_password}
# ---------------------------------------------------------------------------
users_db: dict[str, str] = {}

# ---------------------------------------------------------------------------
# Password hashing (sha256 — fine for dev/in-memory)
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hmac.compare_digest(hash_password(password), hashed)

# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_access_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> str:
    """Return username or raise 401."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class AuthRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    username: str

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="Brand Guardian Auth")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.post("/signup", response_model=TokenResponse)
def signup(body: AuthRequest):
    if body.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    users_db[body.username] = hash_password(body.password)
    token = create_access_token(body.username)
    return TokenResponse(access_token=token)


@app.post("/login", response_model=TokenResponse)
def login(body: AuthRequest):
    hashed = users_db.get(body.username)
    if not hashed or not verify_password(body.password, hashed):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token(body.username)
    return TokenResponse(access_token=token)


@app.get("/me", response_model=UserResponse)
def me(token: str = Depends(oauth2_scheme)):
    username = decode_token(token)
    if username not in users_db:
        raise HTTPException(status_code=401, detail="User not found")
    return UserResponse(username=username)
