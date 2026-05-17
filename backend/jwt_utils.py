from jose import jwt
from datetime import datetime, timedelta, timezone
import time
import os
from dotenv import load_dotenv
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer


load_dotenv()
ACCESS_TOKEN_EXPIRE_MIN = 90
SECRET_KEY = os.getenv("SECRET_KEY")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login") # use to implement TODO

def create_access_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub" : subject, 
        "iat" : int(now.timestamp()),
        "exp" : int((now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MIN)).timestamp())
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    decoded_token = jwt.decode(token, SECRET_KEY)
    return decoded_token["sub"]






