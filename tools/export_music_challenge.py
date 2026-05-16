# pyxfluff 2026

import httpx
import orjson

from time import sleep
from rich import print
from pathlib import Path

serialized = []
songs = httpx.get(
    "https://music.pyxfluff.dev/api/song?_end=1000&_order=ASC&_sort=title&_start=0",
    headers={"x-nd-authorization": Path("./nd_auth").read_text().strip()}
).json()

# print(songs)

for song in songs:
    # if song["rating"] == 0:
    #     print(f"[orange]No rating for {song["title"]}")
    #     continue

    try:
        cover = httpx.get(
            f"https://coverartarchive.org/release-group/{song["mbzReleaseGroupId"]}/front-500",
            follow_redirects=True
        )

        if not cover.status_code in [200, 404]:
            print("[yellow]oops waiting 10 seconds[/]")
            print(cover.status_code)
            sleep(10)

            cover = httpx.get(
                f"https://coverartarchive.org/release/{song["mbzAlbumId"]}/front"
            )

        if cover.status_code == 404:
            cover = httpx.get(
                f"https://coverartarchive.org/release/{song["mbzAlbumId"]}/front",
                follow_redirects=True
            )
    except httpx.HTTPError:
        print("[yellow]CAA request failure[/]")
    except KeyError:
        print(f"[red]{song["title"]} is not a real song!!")
        continue

    try:
        serialized.append(
            {
                "title": song["title"],
                "artist": song["sortAlbumArtistName"],
                "album": song["album"],
                "year": song["year"],
                "rating": song["rating"],
                "cover": str((cover.status_code or 500) == 200 and cover.url or "")  # type: ignore
            }
        )
    except KeyError:
        print(f"[red]{song["title"]} does not have a rating or otherwise hates us")
        continue

    print(f"[green]got {song["title"]}[/]")

Path("songs.json").write_bytes(orjson.dumps(serialized))
