from dotenv import load_dotenv

load_dotenv()

from fastapi.responses import JSONResponse
from fastapi import FastAPI, HTTPException
from app.routers import (
    departments,
    courses,
    university,
    profiles,
    auth,
    library,
    documents,
)
import os
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Adept AI Backend", redirect_slashes=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(departments.router)
app.include_router(courses.router)
app.include_router(university.router)
app.include_router(profiles.router)
app.include_router(auth.router)
app.include_router(library.router)
app.include_router(documents.router)


@app.exception_handler(HTTPException)
def httpExceptionHandler(_, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail},
    )


@app.exception_handler(Exception)
def unexpectedExceptionHandler(_, exc):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app", host="127.0.0.1", port=int(os.getenv("PORT", 3000)), reload=True
    )
