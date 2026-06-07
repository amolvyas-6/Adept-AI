from app.schemas.schemas import PostBase
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def hello_world() -> PostBase:
    return


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)
