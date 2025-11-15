# conftest: configure test: fixtures: allow us to share data between multiple tests
from unittest.mock import AsyncMock, Mock
import os
from typing import AsyncGenerator, Generator  # allow us to use type hinting
import pytest  # to tell it which functions we are going to define as fixtures
from fastapi.testclient import (
    TestClient,  # this will allow us to interact with API without having to run the server
)
from httpx import ASGITransport, AsyncClient, Request, Response  # use to actually make requests to our API

# from socialmediaapi.routers.post import (  # import the in-memory tables
#     comment_table,
#     post_table,
# )

os.environ["ENV_STATE"] = (
    "test"  # set environment variable to test before importing app
)

from socialmediaapi.database import database, user_table  # import the database instance
from socialmediaapi.tests.helpers import create_post  # import helper function to create post
from socialmediaapi.main import app  # import the FastAPI app instance from main.py

# setup for async funcs
# for async function we need to have some sort of async platform that it runs on
@pytest.fixture(
    scope="session"
)  # scope=session means this fixture will be created only once for entire test session
def anyio_backend():
    return "asyncio"  # framework that will be used to run async tests

@pytest.fixture()
async def registered_user(async_client: AsyncClient) -> dict:
    user_details = {"email": "test@example.com", "password": "1234"}
    await async_client.post("/register", json=user_details)
    
    query = user_table.select().where(user_table.c.email == user_details["email"])
    user = await database.fetch_one(query)
    user_details["id"] = user["id"]
    return user_details

#taking registered_user and confirming them in database so that we can use them to login
@pytest.fixture()
async def confirmed_user(registered_user: dict) -> dict:
    query = (
        user_table.update()
        .where(user_table.c.email == registered_user["email"])
        .values(confirmed=True)
    )
    await database.execute(query)
    return registered_user

@pytest.fixture()
async def logged_in_token(async_client: AsyncClient, confirmed_user: dict) -> str:
    response = await async_client.post(
        "/token",
        # json={
        #     "email": registered_user["email"],
        #     "password": registered_user["password"]
        # }
        data={  # ✅ use form data, not JSON
            "username": confirmed_user[
                "email"
            ],  # ✅ OAuth2PasswordRequestForm expects 'username'
            "password": confirmed_user["password"],
        },
    )
    return response.json()["access_token"]

@pytest.fixture()
# the reason we are doing yield instead of return is that we want to do some work before and after yielding called "setup and tear down"
def client() -> Generator:
    yield TestClient(
        app
    )  # create a TestClient instance using the FastAPI app and yield it to the test functions


@pytest.fixture(
    autouse=True
)  # autouse = True means this fixture will be automatically used by all test functions without needing to explicitly include it as a parameter
async def db() -> AsyncGenerator:  # made it async for actual database calls
    # setup: clear the in-memory tables before each test
    # post_table.clear()
    # comment_table.clear()
    await database.connect()
    yield database # yield control to the test function
    # teardown: clear the in-memory tables after each test
    # post_table.clear()
    # comment_table.clear()
    await database.disconnect()


# dependency injection: async_client(client) here async_client will run client fixture first and pass its value to async_client
@pytest.fixture()
async def async_client(client) -> AsyncGenerator:
    # ASGI (Asynchronous Server Gateway Interface) defines how web servers talk to your app.

    # ASGITransport is a class in httpx that acts like a fake network layer between your test client and your FastAPI app.
    # In normal usage:
    # httpx.AsyncClient sends real HTTP requests (over sockets) to URLs like http://127.0.0.1:8000.
    # In testing:
    # You don’t want to actually start a server (uvicorn) and make network calls.
    # So ASGITransport pretends to be a network — it directly calls your FastAPI app in memory.

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=client.base_url) as ac:
        yield ac

#this fixture will ensure that whenever we run tests, the httpx.AsyncClient used in socialmediaapi.tasks is replaced with a mock object
# to avoid accidentally calling mailgun API
@pytest.fixture(autouse=True)
def mock_httpx_client(mocker):
    mock_client = mocker.patch("socialmediaapi.tasks.httpx.AsyncClient")
    mocked_async_client = Mock()
    response = Response(status_code = 200, content="", request=Request("POST", "//"))
    mocked_async_client.post = AsyncMock(return_value=response)
# this .__ is the method that runs when we do "async with httpx.AsyncClient() as client:"
    mock_client.return_value.__aenter__.return_value = mocked_async_client
    
    return mocked_async_client

@pytest.fixture()
async def created_post(async_client: AsyncClient, logged_in_token: str) -> dict:
    return await create_post("Test Post", async_client, logged_in_token)
    # post.setdefault("likes", 0)  #adding likes key with default value 0 as when we create post there are no likes on it
    # return post