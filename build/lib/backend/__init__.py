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
    def __init__(self):
        try:
            for k, v in orjson.loads(
                (Path(__file__).parent / "backend_config.json").read_text()
            ).items():
                obj = self
                for part in k.split(".")[:-1]:
                    if not hasattr(obj, part):
                        setattr(obj, part, type("", (), {})())

                    obj = getattr(obj, part)

                setattr(obj, k.split(".")[-1], v)
        except FileNotFoundError:
            log.error(
                "App config not found. Please make sure backend_config.json exists."
            )
            exit(1)


config = AppConfig()

log.warn("Initializing FastAPI")

app = FastAPI(
    debug=config.dev, # type: ignore
    title="Discourse Router",
    description="Shortlink system for Discourse instances"
)

log.log("Loading routes")

for route in (Path(__file__).parent / "routes").rglob("*.py"):
    mod = route.relative_to(Path(__file__).parent).with_suffix("")
    mod = f"src.{'.'.join(mod.parts)}"

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

log.success("App loaded, handing off")
