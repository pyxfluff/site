# pyxfluff 2026

import httpx
import orjson

from pathlib import Path

from src.backend import config

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api")
cached_posts = {}


@router.get("/songs")
def music_challenge_list(req: Request):
    return JSONResponse(
        orjson.loads((Path(__file__).parents[1] / "data/songs.json").read_text())
    )


@router.get("/blog/latest")
def blog_homepage(req: Request):
    # this mostly just exists to bypass CORS
    # i hope whoever made CORS a thing drives off the nearest cliff
    posts = httpx.get(
        "https://discourse.pyxfluff.dev/c/blog/32/l/latest.json?filter=default"
    ).json()
    cache_hit = True

    for post in posts["topic_list"]["topics"]:
        try:
            post["content"] = cached_posts[post["id"]]
        except KeyError:
            cached_posts[post["id"]] = httpx.get(
                f"https://discourse.pyxfluff.dev/t/{post['id']}.json"
            ).json()

            post["content"] = cached_posts[post["id"]]
            cache_hit = False

    return JSONResponse(
        posts, status_code=200, headers={"x-was-cached": str(cache_hit)}
    )

