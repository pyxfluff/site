# pyxfluff 2026

import httpx
import orjson

from pathlib import Path

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

    try:
        posts = (
            httpx.get(
                "https://discourse.pyxfluff.dev/c/blog/32/l/latest.json?filter=default"
            )
            .raise_for_status()
            .json()
        )
        cache_hit = True

        for post in posts["topic_list"]["topics"]:
            try:
                post["content"] = cached_posts[post["id"]]
            except KeyError:
                cached_posts[post["id"]] = (
                    httpx.get(f"https://discourse.pyxfluff.dev/t/{post['id']}.json")
                    .raise_for_status()
                    .json()
                )

                post["content"] = cached_posts[post["id"]]
                cache_hit = False

        posts["ok"] = True

        return JSONResponse(
            posts,
            status_code=200,
            headers={"x-was-cached": cache_hit and "true" or "false"}
        )

    except httpx.HTTPError:
        return JSONResponse(
            {
                "ok": False,
                "message": "The blog is currently unavailable due to server connection problems. Please try again later.",
                "error-msg": "httpx exception"
            },
            status_code=500,
            headers={"x-was-cached": "false"}
        )

    except (KeyError, IndexError):
        # probably a schema thing, idk what would do it otherwise :3
        return JSONResponse(
            {
                "ok": False,
                "message": "The blog is currently unavailable. Please try again later.",
                "error-msg": "index-based error, likely schema update"
            },
            status_code=500,
            headers={"x-was-cached": "false"}
        )
