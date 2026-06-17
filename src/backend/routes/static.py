# pyxfluff 2026

import subprocess

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

    subprocess.run(
        [
            "sass",
            f"{frontend_dir / 'sass'}:{static_dir / 'css'}",
            "--style=compressed",
            "--no-source-map"
        ],
        check=True
    )

    logger.success("Sass compiled!")
# except sass.CompileError as e:
#     logger.error(f"Sass compilation failed: {e}")
except Exception as e:
    logger.error(f"Unexpected error compiling Sass: {e}")

logger.log("Compiling TypeScript...")

try:
    # can never be too safe :3
    subprocess.run(["bun", "install", "typescript"], check=True)

    subprocess.run(
        [
            "node_modules/.bin/tsc",
            *[str(f) for f in list((frontend_dir / "ts").glob("*.ts"))],
            "--outDir",
            str(static_dir / "js")
        ]
    )
except Exception as e:
    logger.error(f"Unexpected error compiling TypeScript: {e}")

app.mount("/static", StaticFiles(directory=static_dir), name="static")


@router.get("/status")
def status():
    return JSONResponse({"code": 200, "message": "OK"})


logger.success("Mounted /app/src/frontend/static to /static!")
