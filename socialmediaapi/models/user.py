from pydantic import BaseModel

class User(BaseModel):
    id: int | None = None #id can be int or None, None bcz when creating user, id is not provided, but when user returned, id included
    email: str
    
class UserIn(User):
    password: str