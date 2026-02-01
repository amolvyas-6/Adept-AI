from dotenv import load_dotenv

load_dotenv()

from fastapi.responses import JSONResponse
from fastapi import FastAPI, HTTPException
from app.routers import departments
import os


app = FastAPI()

app.include_router(departments.router)


@app.exception_handler(HTTPException)
def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app", host="127.0.0.1", port=int(os.getenv("PORT", 3000)), reload=True
    )
