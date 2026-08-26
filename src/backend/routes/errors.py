# pyxfluff 2026

from fastapi import APIRouter, Request

from src.backend import app

from .pages import render

router = APIRouter(prefix="/e") # ugh

@app.exception_handler(404)
def not_found(req: Request, error_code): # fastapi requires the 2nd param.. idk why..
    return render(req, "exceptions/404", status=404)

@app.exception_handler(500)
def internal_error(req: Request, error_code):
    return render(req, "exceptions/500", {
        "exception_reason": "Something else happened that wasn't protected against."
    }, status=500)
