# pyxfluff 2026

import sass

from backend import app
from backend.lib.logger import Logger

from pathlib import Path
from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

router = APIRouter(
    prefix="/static-files"
)  # make fake endpoint to shut the initializer up (maybe fix someday :3)
logger = Logger("StaticFiles")

static_dir = Path(__file__).parents[1] / "frontend/static"

logger.log("Compiling sass...")
try:
    for file in (static_dir / "css").glob("*.css"):
        file.unlink()

    sass.compile(
        dirname=(static_dir / "sass", static_dir / "css"),  # type: ignore
        output_style="compact"
    )
    logger.success("Sass compiled!")
except sass.CompileError:
    pass

app.mount("/static", StaticFiles(directory=static_dir), name="static")


@router.get("/status")
def status():
    return JSONResponse({"code": 200, "message": "OK"})


logger.success("Mounted /app/src/frontend/static to /static!")
