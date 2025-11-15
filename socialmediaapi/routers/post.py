from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request
from socialmediaapi.database import comments_table, post_table, database, like_table
import logging
from typing import Annotated
import sqlalchemy
from enum import Enum
from socialmediaapi.tasks import generate_and_add_to_post
#note our all functions are async as we are using async database since we dont want to block the event loop while waiting for database operations to complete

#now the issue is that if we have many users making reqs to API at same time , you're not gonna be able to tell who is who from logs as no user info

#using Enum class as we have set of predefined options for sorting: likes, newest first, oldest first

from socialmediaapi.models.post import (
    Comment,
    CommentIn,
    PostLike,
    PostLikeIn,
    UserPost,
    UserPostIn,
    UserPostWithComments,
    UserPostWithLikes
)

from socialmediaapi.models.user import User
from socialmediaapi.security import get_current_user
# from socialmediaapi.security import oauth2_scheme nolonger needed as using dependency injection

router = APIRouter()

logger = logging.getLogger(__name__) #socialmediaapi.routers.post

select_post_and_likes = (
    sqlalchemy.select(
        post_table, #all cols from post_table
        sqlalchemy.func.count(like_table.c.id).label("likes") #label is needed bcz model expects "likes" property to be available when it does validation
    ).select_from(
        post_table.outerjoin(like_table) #joining post and like table on post id
    ).group_by(post_table.c.id) #single row per post
)

@router.get("/")
async def read_root():
    return {"Hello": "World"}


# post_table = {}
# comment_table = {}


async def find_post(post_id: int):
    logger.info(f"Finding post with id: {post_id}")
    
    query = post_table.select().where(post_table.c.id == post_id) #.c is for column
    
    logger.debug(query)
    
    return await database.fetch_one(query) #fetch_one to return first matching record
    # return post_table.get(post_id)

@router.post("/post", response_model=UserPost, status_code=201)
async def create_post(post: UserPostIn, current_user: Annotated[User, Depends(get_current_user)], background_tasks: BackgroundTasks, request: Request, prompt: str = None):
    """No longer need request param as we are using Depends to get current user directly"""
    # async def create_post(post: UserPostIn, request: Request):
    # current_user: User = await get_current_user(await oauth2_scheme(request)) #noqa #to avoid unused variable warning
# oauth2_scheme: go into client request, grab the bearer token, pass it to get_currrent_user function to validate token and get user info
#we aren't using curreent_user var here, but we can associate the post with the user who created it by adding a user_id field to the post model and storing the user's id when creating the post
    
    #If we want user to authenticate before creating post
    
    logger.info("Creating post")
    
    # data = post.model_dump() #model_dump() converts Pydantic model to dictionary
    data = {**post.model_dump(), "user_id": current_user.id} #unpack the dict returned by model_dump and add user_id key with value current_user.id
    query = post_table.insert().values(data) #data: dict, we should ensure dict keys match column names
    logger.debug(query)
    last_record_id = await database.execute(query) #execute returns id of inserted record
    
    if prompt:
        background_tasks.add_task(
            generate_and_add_to_post,
            current_user.email,
            last_record_id,
            request.url_for("get_post_with_comments", post_id=last_record_id),
            database,
            prompt,
        )
    
    return {**data, "id": last_record_id}
    # last_record_id = len(post_table)
    # new_post = {**data, "id": last_record_id}
    # post_table[last_record_id] = new_post
    # return new_post

# if we want to change string "new" in future, we wont have to change code as we are using Enum
class PostSorting(str, Enum):  # str is to ensure enum values are strings
    new = "new"
    old = "old"
    most_likes = "most_likes"

@router.get("/post", response_model=list[UserPostWithLikes])
async def get_all_posts(sorting: PostSorting = PostSorting.new): #since sorting is enum it will become qery string parameter to our API http://api.com/post?sorting=new
    logger.info("Getting all posts")
    # query = post_table.select()
    if sorting == PostSorting.new:
        query = select_post_and_likes.order_by(post_table.c.id.desc()) #if you have column object you can call desc() on it to get descending order
    elif sorting == PostSorting.old:
        query = select_post_and_likes.order_by(post_table.c.id.asc()) 
    elif sorting == PostSorting.most_likes:
        query = select_post_and_likes.order_by(sqlalchemy.desc("likes")) 
        
    logger.debug(query)
    
    return await database.fetch_all(query)
    # return list(post_table.values())


@router.post("/comment", response_model=Comment, status_code=201)
async def create_comment(comment: CommentIn, current_user: Annotated[User, Depends(get_current_user)]):
    logger.info("Creating comment")
    post = await find_post(comment.post_id)
    if not post:
        # logger.error(f"Post with id {comment.post_id} not found")
        raise HTTPException(status_code=404, detail="Post not found")
    
    data = {**comment.model_dump(), "user_id": current_user.id}
    query = comments_table.insert().values(data)
    
    logger.debug(query)
    
    # logger.debug(query, extra={"email": "bob@example.net"}) #this extra data gets logged in log record and can be used as variable by formatter so it can be put in file, in custom filter we will ensure full email address not included but maybe some characters shown
    
    last_record_id = await database.execute(query)
    return {**data, "id": last_record_id}
    # last_record_id = len(comment_table)
    # new_comment = {**data, "id": last_record_id}
    # comment_table[last_record_id] = new_comment
    # return new_comment


@router.get("/post/{post_id}/comment", response_model=list[Comment])
async def get_comments_on_post(post_id: int):
    logger.info("Getting comments on post")
    post = await find_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    query = comments_table.select().where(comments_table.c.post_id == post_id)
    logger.debug(query)
    return  await database.fetch_all(query)
    # comments = [
    #     comment for comment in comment_table.values() if comment["post_id"] == post_id
    # ]
    # return comments


@router.get("/post/{post_id}", response_model=UserPostWithComments)
async def get_post_with_comments(post_id: int):
    logger.info("Getting post and its comments")
    # post = await find_post(post_id)
    query = select_post_and_likes.where(post_table.c.id == post_id)
    logger.debug(query)
    post = await database.fetch_one(query)
    if not post:
        # logger.error(f"Post with id {post_id} not found")
        raise HTTPException(status_code=404, detail="Post not found")
    return {
        "post": post,
        "comments": await get_comments_on_post(post_id),
    }
    
@router.post("/like", response_model=PostLike, status_code=201)
async def like_post(
    like: PostLikeIn, 
    current_user: Annotated[User, Depends(get_current_user)]
):
    logger.info("Liking post")
    post = await find_post(like.post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    data = {**like.model_dump(), "user_id": current_user.id}
    query = like_table.insert().values(data)
    logger.debug(query)
    last_record_id = await database.execute(query)
    return {**data, "id": last_record_id}
