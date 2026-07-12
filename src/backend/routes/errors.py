# pyxfluff 2026

from .pages import render
from src.backend import app

from fastapi import APIRouter, Request

router = APIRouter(prefix="/e") # ugh

@app.exception_handler(404)
def not_found(req: Request, error_code): # fastapi requires the 2nd param.. idk why..
    return render(req, "404.html", status=404)
