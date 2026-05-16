# pyxfluff 2026

import orjson

from pathlib import Path

fixed = []
for song in orjson.loads(Path("./songs.json").read_text()):
    split = song["artist"].split(",")
    if len(split) > 1:
        split = [x.strip() for x in split]
        song["artist"] = f"{split[1]} {split[0]}"

    print(song["artist"])

    fixed.append(song)

Path("songs.json").write_bytes(orjson.dumps(fixed))
