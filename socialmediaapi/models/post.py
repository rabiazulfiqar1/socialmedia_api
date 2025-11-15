from pydantic import BaseModel, ConfigDict
from typing import Optional

class UserPostIn(BaseModel):
    body: str


class UserPost(UserPostIn):
    model_config = ConfigDict(from_attributes=True) #allows Pydantic model to read data from ORM objects(sql row objects returned by fetchone and fetchall etc)
    # from_attributes=True helps us access with "." dot notation like post.id, post.body
    id: int
    user_id: int
    image_url: Optional[str] = None  #URL of the image associated with the post, if any
    
class UserPostWithLikes(UserPost):
    likes: int  #number of likes on the post
    model_config = ConfigDict(from_attributes=True)
    
class CommentIn(BaseModel):
    body: str
    post_id: int

class Comment(CommentIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    
class UserPostWithComments(BaseModel): 
    post: UserPostWithLikes
    comments: list[Comment]
    
# {
#     "post": {"id": 0, "body": "my post"}, 
#     "comments": [{"id": 2, "post_id": 0, "body": "my comment"}] 
# }

#what data will we recieve when client like a post
class PostLikeIn(BaseModel):
    post_id: int
    
class PostLike(PostLikeIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int