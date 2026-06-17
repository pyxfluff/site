# pyxfluff 2026

import orjson

from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/data")


@router.get("/songs")
def music_challenge_list(req: Request):
    return JSONResponse(orjson.loads((Path(__file__).parents[1] / "data/songs.json").read_text()))
