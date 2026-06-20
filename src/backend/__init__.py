# pyxfluff 2026

import orjson

from importlib import import_module
from pathlib import Path
from rich.console import Console

from fastapi import FastAPI

console = Console(force_terminal=True)

from .lib.logger import Logger

log = Logger("InitThread")

log.warn("Backend worker starting, loading AppConfig model")


# load config
class AppConfig:
    # no more complex ass json logic that doesn't work for literally no reason
    dev = True
    web_host = "0.0.0.0"
    web_port = 8000
    web_workers = 2
    enable_ts = False


config = AppConfig()

log.warn("Initializing FastAPI")

app = FastAPI(
    debug=config.dev,
    title="DomainRoot",
    description="pyxfluff.dev homepage"
)

log.log("Loading routes")

for route in (Path(__file__).parent / "routes").rglob("*.py"):
    mod = route.relative_to(Path(__file__).parent).with_suffix("")
    mod = f"src.backend.{'.'.join(mod.parts)}"

    log.log(f"Importing {mod}")

    imported_route = import_module(mod)

    try:
        if imported_route.router:
            app.include_router(imported_route.router)
            log.success("Successfully imported!")
    except (ImportError, AttributeError):
        log.error(
            f"Module {mod} is missing name `router`; make sure it has a valid APIRouter or move it outside of the routes folder"
        )

log.success(
    f"App loaded (running at http://{config.web_host}:{config.web_port}), handing off"
)
