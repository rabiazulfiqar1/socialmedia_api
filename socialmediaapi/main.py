from contextlib import asynccontextmanager
from fastapi.exception_handlers import http_exception_handler
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from socialmediaapi.routers.post import router as post_router
from socialmediaapi.routers.user import router as user_router
from socialmediaapi.routers.upload import router as upload_router
from socialmediaapi.database import database
from socialmediaapi.logging_conf import configure_logging
import logging
from asgi_correlation_id import CorrelationIdMiddleware

logger = logging.getLogger(__name__)

#context manager is basically a function that sets up a context for some code to run in, and then cleans up after that code has run: setup and teardown logic
#lifespan event to connect and disconnect the database when the app starts and stops: it's done before any request is handled
@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger.info("HELLO RABIA")
    await database.connect()
    yield #lifespan function will pause here and let the app run to handle requests and when the app is shutting down, it will resume here
    await database.disconnect()

app = FastAPI(lifespan=lifespan)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(post_router)
app.include_router(user_router)
app.include_router(upload_router)

@app.exception_handler(HTTPException)
async def http_exception_handle_logging(request, exc: HTTPException):
    logger.error(f"HTTP Exception: {exc.status_code} {exc.detail}")
    return await http_exception_handler(request, exc)
