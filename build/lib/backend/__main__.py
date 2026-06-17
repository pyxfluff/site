# pyxfluff 2026

from uvicorn import run

from backend import config, app
from backend.lib.logger import Logger

logger = Logger("Main")

logger.log(f"Spawning uvicorn worker (workers={config.web.workers})") # type: ignore

run(
    app="src:app",
    host=config.web.host,         # type: ignore
    port=int(config.web.port),    # type: ignore
    workers=config.web.workers,   # type: ignore
    reload=config.dev             # type: ignore
)
