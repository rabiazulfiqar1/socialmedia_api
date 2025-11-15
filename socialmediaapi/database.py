import databases
import sqlalchemy
from socialmediaapi.config import config

metadata = sqlalchemy.MetaData()

user_table = sqlalchemy.Table(
    "user",  # table name
    metadata,  # it also validates the links between tables
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column(
        "email", sqlalchemy.String, unique=True
    ),  # unique: no two users can have same email
    sqlalchemy.Column("password", sqlalchemy.String),
    sqlalchemy.Column("confirmed", sqlalchemy.Boolean, default=False),
)

post_table = sqlalchemy.Table(
    "post",  # table name
    metadata, # it stores details about tables, columns, and constraints: metadata object holds the information about our database schema
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True), #auto incrementing primary key column
    sqlalchemy.Column("body", sqlalchemy.String),
    sqlalchemy.Column("user_id", sqlalchemy.ForeignKey("user.id"), nullable=False), #foreign key to user table
    sqlalchemy.Column("image_url", sqlalchemy.String) #each post can have an optional image URL
)

comments_table = sqlalchemy.Table(
    "comments",  # table name
    metadata,  # it also validates the links between tables
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True), 
    sqlalchemy.Column("body", sqlalchemy.String),
    sqlalchemy.Column("post_id", sqlalchemy.ForeignKey("post.id"), nullable=False), #we didnt use datatype: sqlalchemy.Integer because metadata will automatically infer the datatype from the referenced column
    sqlalchemy.Column("user_id", sqlalchemy.ForeignKey("user.id"), nullable=False), 
)

#table will define who likes which post
like_table = sqlalchemy.Table(
    "likes",  # table name
    metadata,  # it also validates the links between tables
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True), 
    sqlalchemy.Column("post_id", sqlalchemy.ForeignKey("post.id"), nullable=False), 
    sqlalchemy.Column("user_id", sqlalchemy.ForeignKey("user.id"), nullable=False), 
)

engine = sqlalchemy.create_engine(
    config.DATABASE_URL,
    connect_args={
        "check_same_thread": False
    },  # connect_args={"check_same_thread": False} is needed only for SQLite databases as they are single-threaded,
    # by writing this we are allowing the database to be accessed from different threads: useful for background tasks
)

metadata.create_all(engine)

database = databases.Database(
    config.DATABASE_URL, force_rollback=config.DB_FORCE_ROLL_BACK
)