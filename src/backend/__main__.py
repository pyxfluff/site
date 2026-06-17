# pyxfluff 2026

from uvicorn import run

from src.backend import config, app
from src.backend.lib.logger import Logger

logger = Logger("Main")

logger.log(f"Spawning uvicorn worker (workers={config.web_workers})") # type: ignore

run(
    app="src.backend:app",
    host=config.web_host,
    port=int(config.web_port),
    workers=config.web_workers,
    reload=config.dev
)
