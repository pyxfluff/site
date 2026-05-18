// pyxfluff 2025

const enableMusicPull = true;

interface LastFmArtist {
    name: string;
}

interface LastFmTrack {
    name: string;
    artist: LastFmArtist;
    playcount: string;
}

interface LastFmAlbum {
    name: string;
    artist: LastFmArtist;
    playcount: string;
    image: Array<{ "#text": string }>;
}

interface SearchResult {
    title: string;
    artist: string;
    embed_url: string;
    art: string;
}

interface MusicChallengeSong {
    title: string;
    artist: string;
    album: string;
    year: number;
    rating: number;
    cover: string;
}

const initMusicPage = (async () => {
    if (!enableMusicPull) return null;

    const [tracksRes, albumsRes] = await Promise.all([
        fetch("https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&format=json&limit=10&period=1month"),
        fetch("https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&format=json&limit=10&period=1month")
    ]);

    const tracks = (await tracksRes.json() as { toptracks: { track: LastFmTrack[] } }).toptracks.track;
    const albums = (await albumsRes.json() as { topalbums: { album: LastFmAlbum[] } }).topalbums.album;

    // load music challenge before the page gets too slow
    // TODO: We can probably remove the 2025 music challenge??? Or at least use the data better,,
    //const musicChallengeData = await (await fetch("/data/music_challenge.json")).json()

    //document.getElementById("music-challenge").innerText = musicChallengeData.data

    const newMusicChallengeData = ((await (await fetch("/data/songs.json")).json()) as Record<string, MusicChallengeSong[]>)["2026"] ?? [];

    (document.querySelector(".music-challenge-table tbody") as HTMLElement).innerHTML = newMusicChallengeData.map((song: MusicChallengeSong) => {
        return `
            <tr data-song-name="${song.title}" data-artist-name="${song.artist}" data-album-name="${song.album}">
                <td class="song-cover">
                    <img src="${song.cover}" alt="${song.album}" loading="lazy" />
                </td>
                <td class="song-info">
                    <h4 class="title">${song.title}</h4>
                    <span class="artist">${song.artist}</span>
                </td>
                <td class="song-album">${song.album}</td>
                <td class="song-year">${song.year}</td>
                <td class="song-rating">${song.rating}/5</td>
            </tr>
        `;
    }).join("");

    const searchInput = document.getElementById("music-search-input") as HTMLInputElement;
    const searchClear = document.getElementById("music-search-clear") as HTMLElement;
    const tableBody = document.querySelector(".music-challenge-table tbody") as HTMLElement;
    if (searchInput && searchClear && tableBody) {
        const filterAndHighlight = () => {
            const query = searchInput.value.toLowerCase().trim();
            const rows = Array.from(tableBody.querySelectorAll("tr"));
            if (!query) {
                rows.forEach(row => {
                    row.style.display = "";
                    row.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));
                });
                return;
            }
            rows.forEach(row => {
                const song = (row.getAttribute("data-song-name") ?? "").toLowerCase();
                const artist = (row.getAttribute("data-artist-name") ?? "").toLowerCase();
                const album = (row.getAttribute("data-album-name") ?? "").toLowerCase();
                const isMatch = song.includes(query) || artist.includes(query) || album.includes(query);
                if (isMatch) {
                    row.style.display = "";
                    const regex = new RegExp(`(${query})`, "gi");
                    const cells = [row.querySelector(".song-info .title"), row.querySelector(".song-info .artist"), row.querySelector(".song-album")];
                    cells.forEach(cell => {
                        if (cell) cell.innerHTML = (cell.textContent ?? "").replace(regex, "<span class='highlight'>$1</span>");
                    });
                } else {
                    row.style.display = "none";
                }
            });
        };
        searchInput.addEventListener("input", filterAndHighlight);
        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            filterAndHighlight();
        });
    }


    const searchResults = await (await fetch("https://spotifysvc.pyxfluff.dev/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(tracks.map((track: LastFmTrack) => ({ name: track.name, artist: track.artist.name })))
    })).json() as SearchResult[];

    const repeatSongsList = document.getElementById("repeat-songs-list");
    const repeatAlbumList = document.getElementById("repeat-album-list");

    if (repeatSongsList) {
        repeatSongsList.innerHTML = await Promise.all(tracks.map(async (track: LastFmTrack) => {
            const result = searchResults.find((res: SearchResult) => res.title === track.name);

            return `
            <div class="card song-card-mini song" data-embed-url="${result ? result.embed_url : null}">
                <div class="song-artwork">
                    <img class='art' src='${result ? result.art : ""}'>
                </div>

                <div class="song-info">
                    <div class="song-title"><span class="song-title">${track.name}</span></div>
                    <div class="song-artist">${track.artist.name} · ${track.playcount} plays</div>
                </div>
            </div>
            `;
        })).then(html => html.join(""));
    }

    if (repeatAlbumList) {
        repeatAlbumList.innerHTML = albums.map((album: LastFmAlbum) => {
            const result = searchResults.find((res: SearchResult) => res.title === album.name && res.artist === album.artist.name);

            return `
            <div class="card song-card-mini" data-embed-url="${result ? result.embed_url : null}">
                <div class="song-artwork">
                    <img class='art' src='${album.image[3]["#text"]}'>
                </div>

                <div class="song-info">
                    <div class="song-title"><span class="song-title">${album.name}</span></div>
                    <div class="song-artist">${album.artist.name} · ${album.playcount} plays</div>
                </div>
            </div>
            `;
        }).join(" ");
    }

    // Add event listener for the cards to print out the embed URL when clicked
    const cards = document.querySelectorAll(".card.song-card-mini.song");
    cards.forEach(card => {
        card.addEventListener("click", () => {
            const embedUrl = card.getAttribute("data-embed-url");
            (document.querySelector(".music-display") as HTMLElement).style.position = "absolute";

            if (embedUrl) {
                (document.querySelector(".music-display .embed") as HTMLElement).innerHTML = `<iframe style="border-radius:12px" src="${embedUrl}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
                (document.querySelector(".music-display") as HTMLElement).classList.remove("hidden");
            } else {
                console.log("No embed URL available.");
            }
        });
    });
});

(async () => {
    (document.querySelector(".music-display") as HTMLElement).addEventListener("click", async () => {
        (document.querySelector(".music-display") as HTMLElement).classList.add("hidden");

        // force-stop the player
        (document.querySelector(".music-display .embed") as HTMLElement).innerHTML = ""
    });

    await initMusicPage();
})();
