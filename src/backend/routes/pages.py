# pyxfluff 2026

import subprocess

from src.backend import app

from pathlib import Path

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


def render(req, template_name):
    return templates.TemplateResponse(
        request=req, name=template_name, context={"git_hash": git_hash()}
    )


@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    return render(request, "home.html")


@app.get("/about", response_class=HTMLResponse)
async def about(request: Request):
    return render(request, "about.html")


@app.get("/links", response_class=HTMLResponse)
async def links(request: Request):
    return render(request, "links.html")


@app.get("/blog", response_class=HTMLResponse)
async def blog(request: Request):
    return render(request, "blog/home.html")


@app.get("/music", response_class=HTMLResponse)
async def music(request: Request):
    return render(request, "music.html")


@app.get("/projects", response_class=HTMLResponse)
async def projects(request: Request):
    return render(request, "projects.html")


@app.get("/status", response_class=HTMLResponse)
async def status(request: Request):
    return render(request, "status.html")
