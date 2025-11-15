from fastapi import APIRouter, HTTPException, status, Depends, Request
# from fastapi import Form
from typing import Annotated
from socialmediaapi.models.user import UserIn
from socialmediaapi.security import (
    get_user, 
    get_password_hash, 
    authenticate_user, 
    create_access_token, 
    get_subject_for_token_type,
    create_confirmation_token
)
from socialmediaapi.database import user_table, database
import logging
from fastapi.security import OAuth2PasswordRequestForm

logger = logging.getLogger(__name__)

router = APIRouter()

#we want to send user confirmation email url which is clicked by user and then user is confirmed
#To do this, when user registers, we give them a link and in that link is going to be a JWT and when they click the link, it will go to our API and in that endpint we will extract JWT and use it to identify user and confirm

@router.post("/register", status_code=201)
async def register(user: UserIn, request: Request):
    if await get_user(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="User with this email already exists"
        )
    # query = user_table.insert().values(email=user.email, password=user.password) #id primary key and auto generated
    
    #dont do anything with user's password until hashed, don't put it into logs, don't print it out, dont send it anywhere
    hashed_password = get_password_hash(user.password)
    query = user_table.insert().values(email=user.email, password=hashed_password)

    logger.debug(query)
    
    await database.execute(query)
    # return {"detail": "User created."}
    return {
        "detail": "User created. Please confirm your email.",
        "confirmation_url": request.url_for(
            "confirm_email", token=create_confirmation_token(user.email)
        )
    }

#The following implementation can't work with swagger UI as it only supports form data for OAuth2PasswordRequestForm and not JSON body (UserIn)
# @router.post("/token")
# async def login(user: UserIn):
#     user = await authenticate_user(user.email, user.password)
#     access_token = create_access_token(email=user.email)
#     return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token")
async def login(
    # username: Annotated[str, Form()], 
    # password: Annotated[str, Form()],   
    # grant_type: Annotated[str, Form()]
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    user = await authenticate_user(form_data.username, form_data.password)
    access_token = create_access_token(email=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

#get bcz we are going to send this endpoint in email to users and when they will click this url or endpoint, they're going to open their browser and will come to this endpoint which is going to make a get request
#NOTE: when browsers access a URL, they make a GET request by default
@router.get("/confirm/{token}")
async def confirm_email(token: str):
    email = get_subject_for_token_type(token, "confirmation")
    # update user confirmed status
    query = (
        user_table.update().where(user_table.c.email == email).values(confirmed=True)
    )
    logger.debug(query)
    await database.execute(query)
    return {"detail": "User confirmed"}