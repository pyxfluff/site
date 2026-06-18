# pyxfluff 2026

import httpx
import orjson

from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api")


@router.get("/songs")
def music_challenge_list(req: Request):
    return JSONResponse(orjson.loads((Path(__file__).parents[1] / "data/songs.json").read_text()))

@router.get("/blog/latest")
def blog_homepage(req: Request):
    # this mostly just exists to bypass CORS
    # i hope whoever made CORS a thing drives off the nearest cliff
    return JSONResponse(httpx.get("https://discourse.pyxfluff.dev/c/blog/32/l/latest.json?filter=default").json())
