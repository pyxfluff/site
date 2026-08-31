# pyxfluff 2026

import subprocess
from datetime import UTC, datetime
from json.decoder import JSONDecodeError
from pathlib import Path

import httpx
import humanize
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from src.backend import app, config

templates = Jinja2Templates(directory=Path(__file__).parents[2] / "frontend/templates")
router = APIRouter()


def git_hash():
    x = subprocess.run(
        ["git", "-C", Path(__file__).parents[3], "rev-parse", "--short", "HEAD"],
        capture_output=True,
        text=True,
        check=False
    )
    return x.stdout.strip()

print(git_hash())

def render(req, template_name, extra_context: dict | None = None, status: int = 200):
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
@app.get("/blog/{post_id}")
def blog_post(req: Request, post_id: int | str):
    # no use caching here
    try:
        post = httpx.get(
            f"{config.blog_url}/t/{post_id}.json",
            follow_redirects=True,  # allow for slug-based searching
        ).json()
        title = post["fancy_title"]
        post = post["post_stream"]["posts"][0]

        serialized = {
            "id": post["id"],
            "author": {
                "name": post["name"],
                "username": post["username"],
                "avatar": f"{config.blog_url}{post['avatar_template'].replace('{size}', '96')}"
            },
            "content": post["cooked"],
            "title": title,
            "base_url": config.blog_url,
            "posted": humanize.naturaltime(
                datetime.strptime(
                    post["created_at"], "%Y-%m-%dT%H:%M:%S.%fZ"
                ).astimezone(UTC)
            )
        }

        return render(
            req,
            "blog/post",
            {"title": f"Blog - {serialized['title']}", "post": serialized},
        )
    except KeyError:
        # nice try liberal
        return render(
            req, "exceptions/404", {"404_debug": "blog_post_not_found"}, status=404
        )
    except JSONDecodeError:
        return render(
            req,
            "exceptions/500",
            {
                "exception_reason": """
            Couldn't retrieve that blog post due to a server connection problem or other invalid response. The blog backend is likely offline or experiencing temporary connection issues. This isn't really something you should tell me about but feel free to peek at the <a
                href='/status'
                >status page</a> to know when it [discourse] is back!"""
            },
            status=500
        )
