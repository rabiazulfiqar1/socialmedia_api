import logging
from passlib.context import CryptContext
import datetime
from typing import Annotated, Literal
from jose import jwt, ExpiredSignatureError, JWTError
from fastapi import Depends, HTTPException, status
from socialmediaapi.database import database, user_table
from fastapi.security import OAuth2PasswordBearer

logger = logging.getLogger(__name__)

#JWT also known as access or bearer tokens are used for authentication and authorization

SECRET_KEY = "9b73f2a1bdd7ae163444473d29a6885ffa22ab26117068f72a5a56a74d12d1fc"
ALGORITHM = "HS256"  #hashing algorithm used to sign the JWT
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  #tokenUrl: endpoint where user can send email and password to get the token
# oauth2_scheme() #this instance will be used in path operations to extract and validate the token from the request
pwd_context = CryptContext(schemes=["bcrypt"]) #tell algo in schemes

# credentials_exception = HTTPException(
#     status_code=status.HTTP_401_UNAUTHORIZED,
#     detail="Could not validate credentials",
#     headers={"WWW-Authenticate": "Bearer"},
# )

def create_credentials_exception(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )

#made it a separate function as it will be helpful in testing, we can mock this function to return a short expiry time for testing token expiration
def access_token_expire_minutes() -> int:
    return 30  #access token will expire in 30 minutes

def confirm_token_expire_minutes() -> int:
    return 1440  # confirmation token will expire in 1440 minutes (24 hours)


def create_access_token(email: str): #email will be stored in the payload of access toke, you can also store user id, as long as it is unique, you can use it to identify user
    #JWT has 3 parts: header, payload, signature
    #header: contains metadata about the token, including the type of token (JWT) and the signing algorithm used (HS256)
    #payload: contains the claims, which are statements about an entity (typically, the user) and additional data. Here we will store user's email
    #signature: used to verify that the token hasn't been altered. It is created by taking the encoded header, encoded payload, a secret key, and the algorithm specified in the header
    logger.debug("Creating access token", extra={"email": email})
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
        # minutes=30
        minutes=access_token_expire_minutes()
    ) #token valid for 30 minutes
    # jwt_data = {"sub": email, "exp": expire} #sub: subject of the token (who the access token is for), exp: expiration time, payload
    jwt_data = {"sub": email, "exp": expire, "type": "access"} #added type claim to differentiate between access and confirmation tokens
    encoded_jwt = jwt.encode(jwt_data, key=SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_confirmation_token(email: str): 
    logger.debug("Creating confirmation token", extra={"email": email})
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
        # minutes=30
        minutes=confirm_token_expire_minutes()
    )  
    jwt_data = {
        "sub": email,
        "exp": expire,
        "type": "confirmation",
    } 
    encoded_jwt = jwt.encode(jwt_data, key=SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

#this func will allow us to get sub field in payload for specific token type
def get_subject_for_token_type(token: str, type: Literal["access", "confirmation"]) -> str: #Literal will ensure type value can only be "access" or "confirmation"
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError as e:  # expired token
        # raise HTTPException(
        #     status_code=status.HTTP_401_UNAUTHORIZED,
        #     detail="Token has expired",
        #     headers={
        #         "WWW-Authenticate": "Bearer"
        #     },  # extra data in rsponse that tell client some info, we're going to tell them that in order to gain access to whatever endpoint they were trying to access, they need to provide a valid bearer token
        # ) from e  # as HTTPException is caused by ExpiredSignatureError
        raise create_credentials_exception("Token has expired") from e
    except JWTError as e:  # error like JWT is malformed or signature invalid
        raise create_credentials_exception("Invalid Token") from e

    email = payload.get("sub")
    if email is None:  # no email in payload
        raise create_credentials_exception("Token is missing 'sub' field")

    token_type = payload.get("type")
    if token_type is None or token_type != type:  # ensure that the token is an access token
        raise create_credentials_exception(f"Token has incorrect type, expected '{type}'")

    return email

#once password hashed, it can't be unhashed, so we will hash the password provided during login in database and compare the two hashes
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

#if you hash same password multiple times, you get different hashes due to salting
#salting: adding random data to input of hash function to guarantee unique output even for same input

#the info used to generate the hash is stored within the hash itself,
#so pwd_context.verify uses the info stored in the hash to hash the plain password correctly and then it will be same

#when user logs in, we will hash the provided password and compare it with the hashed password stored in database
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def get_user(email: str):
    logger.debug("Fetching user from the database", extra={"email": email})
    query = user_table.select().where(user_table.c.email == email)
    result = await database.fetch_one(query)
    if result:
        return result
    return None

async def authenticate_user(email: str, password: str) -> bool:
    logger.debug("Authenticating user", extra={"email": email})
    user = await get_user(email)
    if not user:
        raise create_credentials_exception("Invalid email or password")
    if not verify_password(password, user.password): #user.password is hashed password from database and password is plain password provided during login
        raise create_credentials_exception("Invalid email or password")
    if not user.confirmed:
        raise create_credentials_exception("User has not confirmed email")
    return user

#this function grab token from user request and decode it to get user info
#But from where this token is coming, where are we storing it? It will come from the Authorization header of the HTTP request
# async def get_current_user(token: str): Here we were getting token by calling oauth2_scheme manually
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]): #Here we are using FastAPI's dependency injection system to automatically extract the token from the request using oauth2_scheme
    logger.debug("Getting current user from token")
    email = get_subject_for_token_type(token, "access")
    user = await get_user(email)
    if user is None: #user doesnt exist ifn database
        raise create_credentials_exception("Could not find user for this token")
    return user