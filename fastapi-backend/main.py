from dotenv import load_dotenv

load_dotenv()

import os

from app.routers import (
    auth,
    chats,
    courses,
    departments,
    documents,
    library,
    profiles,
    university,
)
from app.schemas.core import ApiError
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Adept AI Backend", redirect_slashes=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

app.include_router(departments.router)
app.include_router(courses.router)
app.include_router(university.router)
app.include_router(profiles.router)
app.include_router(auth.router)
app.include_router(library.router)
app.include_router(documents.router)
app.include_router(chats.router)


@app.exception_handler(HTTPException)
def httpExceptionHandler(_, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ApiError(success=False, message=exc.detail).model_dump(),
    )


@app.exception_handler(Exception)
def unexpectedExceptionHandler(_, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=ApiError(success=False, message=str(exc)).model_dump(),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app="main:app", host="127.0.0.1", port=int(os.getenv("PORT", 3000)), reload=True
    )
