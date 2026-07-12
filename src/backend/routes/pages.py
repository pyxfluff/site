# pyxfluff 2026

import httpx
import subprocess

from src.backend import app

from pathlib import Path
from typing import Optional

from fastapi import Request, APIRouter
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory=Path(__file__).parents[2] / "frontend/templates")
router = APIRouter()


def git_hash():
    return subprocess.run(
        ["git", "-C", Path(__file__).parents[4], "rev-parse", "--short", "HEAD"],
        capture_output=True,
        text=True
    ).stdout.strip()


def render(req, template_name, extra_context: Optional[dict] = None, status: int = 200):
    extra_context = extra_context or {}

    extra_context["git_hash"] = git_hash()

    return templates.TemplateResponse(
        request=req,
        name=f"{template_name}.html",
        context=extra_context,
        status_code=status
    )


@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    return render(request, "home")


@app.get("/about", response_class=HTMLResponse)
async def about(request: Request):
    return render(request, "about")


@app.get("/links", response_class=HTMLResponse)
async def links(request: Request):
    return render(request, "links")


@app.get("/blog", response_class=HTMLResponse)
async def blog(request: Request):
    return render(request, "blog/home")


@app.get("/music", response_class=HTMLResponse)
async def music(request: Request):
    return render(request, "music")


@app.get("/projects", response_class=HTMLResponse)
async def projects(request: Request):
    return render(request, "projects")


@app.get("/status", response_class=HTMLResponse)
async def status(request: Request):
    return render(request, "status")


# blog posts
@app.get("/blog/{post_id:int}")
async def blog_post(req: Request, post_id: int):
    # no use caching here
    try:
        post = httpx.get(f"https://discourse.pyxfluff.dev/t/{post_id}.json").json()[
            "post_stream"
        ]["posts"][0]
        serialized = {
            "id": post["id"],
            "author": {"name": post["name"], "username": post["username"]},
            "content": post["cooked"]
        }

        return render(req, "blog/post", {"post_id": post_id, "post": serialized})
    except KeyError:
        # nice try liberal
        return render(req, "404", status=404)
