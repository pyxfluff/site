# pyxfluff 2026

import asyncio
import subprocess

from src.backend import app, config
from src.backend.lib.logger import Logger

from pathlib import Path
from watchfiles import awatch

from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

router = APIRouter(
    prefix="/static-files"
)  # make fake endpoint to shut the initializer up (maybe fix someday :3)
logger = Logger("StaticFiles")

frontend_dir = Path(__file__).parents[2] / "frontend"
static_dir = frontend_dir / "static"

def build_css():
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

async def watch_scss():
    logger.success("Watching for scss changes!")

    async for changes in awatch(frontend_dir / "sass"):
        logger.log(f"Update detected in {next(iter(changes))[1]}, reloading css")
        build_css()

logger.log("Compiling sass...")
try:
    build_css()

    # lazy fix, i dont feel like implementing a lifespan atm but might be worthwhile eventually
    # https://fastapi.tiangolo.com/advanced/events/
    @app.on_event("startup")
    async def startup():
        asyncio.create_task(watch_scss())

    logger.success(f"Sass compiled: {frontend_dir / 'sass'}:{static_dir / 'css'}")

# except sass.CompileError as e:
#     logger.error(f"Sass compilation failed: {e}")
except Exception as e:
    logger.error(f"Unexpected error compiling Sass: {e}")

if config.enable_ts:
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
    finally:
        logger.success(f"Compiled TypeScript to {str(static_dir / 'js')}!")
else:
    logger.warn(
        f"TypeScript compilation disabled in config, using {str(static_dir / 'js')}."
    )

app.mount("/static", StaticFiles(directory=static_dir), name="static")


@router.get("/status")
def status():
    return JSONResponse({"code": 200, "message": "OK"})


logger.success(f"Mounted {static_dir} to /app/static!")
