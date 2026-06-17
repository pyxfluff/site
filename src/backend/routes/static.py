# pyxfluff 2026

import sass

from src.backend import app
from src.backend.lib.logger import Logger

from pathlib import Path

from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

router = APIRouter(
    prefix="/static-files"
)  # make fake endpoint to shut the initializer up (maybe fix someday :3)
logger = Logger("StaticFiles")

frontend_dir = Path(__file__).parents[2] / "frontend"
static_dir = frontend_dir / "static"

logger.log("Compiling sass...")
try:
    for file in (static_dir / "css").glob("*.css"):
        file.unlink()

    sass.compile(
        dirname=(frontend_dir / "sass", static_dir / "css"),  # type: ignore
        output_style="compact"
    )
    logger.success("Sass compiled!")
except sass.CompileError as e:
    logger.error(f"Sass compilation failed: {e}")
except Exception as e:
    logger.error(f"Unexpected error: {e}")

app.mount("/static", StaticFiles(directory=static_dir), name="static")


@router.get("/status")
def status():
    return JSONResponse({"code": 200, "message": "OK"})


logger.success("Mounted /app/src/frontend/static to /static!")
