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

declare const MicroModal: {
    init: (config?: unknown) => void;
    show: (targetModal: string, config?: unknown) => void;
    close: (targetModal: string) => void;
};

if (typeof MicroModal !== "undefined") {
    MicroModal.init({
        awaitOpenAnimation: true,
        awaitCloseAnimation: true,
        disableScroll: true
    });
}

async function getTracks(artist: string, albumName: string | undefined) {
    try {
        // good luck to future me
        const vals = Object.values((await (await fetch('/api/songs')).json() as Record<string, any[]>))
        if (albumName && albumName !== "")
            return (vals.flat()).filter(s => (s.album || '').toLowerCase() === albumName.toLowerCase() && (s.artist || '').toLowerCase() === artist.toLowerCase());

        // just the artist..
        return (vals.flat()).filter(s => (s.artist || '').toLowerCase() === artist.toLowerCase());
    } catch (e) {
        return [];
    }
}

async function showModal(artist: string, albumName: string, cover?: string) {
    const tracks = await getTracks(artist, albumName);

    // ratings and track order come from the local songs.json entries we fetched above
    const ratingsMap: Record<string, number> = {};
    tracks.forEach((t: any) => { if (t.title) ratingsMap[t.title] = t.rating ?? 0; });

    // average for whole album
    let totalRating = 0
    tracks.forEach(t => { totalRating += t.rating });

    // probably better ways to do this :broken_heart:
    let ratings: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
    tracks.forEach(t => {
        ratings[String(t.rating)] += 1;
    });

    const titleText = document.getElementById('modal-title-text');
    const modalCoverSmall = document.getElementById('modal-cover-small') as HTMLImageElement | null;
    const coverEl = document.getElementById('album-cover') as HTMLImageElement | null;
    const songsEl = document.getElementById('album-songs');
    const summaryEl = document.getElementById('album-summary');

    if (albumName && albumName !== "") {
        if (titleText) titleText.textContent = `Details - ${albumName}`;
        if (modalCoverSmall) modalCoverSmall.src = cover || (tracks[0] && tracks[0].cover) || '';
        if (coverEl) coverEl.src = cover || (tracks[0] && tracks[0].cover) || '';
        if (summaryEl) {
            // omg shut up
            (summaryEl.querySelector("h2") as HTMLElement).innerText = albumName;
            (summaryEl.querySelector("h4") as HTMLElement).innerText = artist;
            (summaryEl.querySelector("span") as HTMLElement).innerText = `${tracks[1].year} • Average Rating: ${Math.floor((totalRating / tracks.length) * 10) / 10}`; // i hope this is trustworthy
        }
    } else {
        if (titleText) titleText.textContent = `${artist} - Summary`;
        if (modalCoverSmall) modalCoverSmall.src = cover || (tracks[0] && tracks[0].cover) || '';
        if (coverEl) coverEl.src = cover || (tracks[0] && tracks[0].cover) || '';
        if (summaryEl) {
            (summaryEl.querySelector("h2") as HTMLElement).innerText = artist;
            (summaryEl.querySelector("h4") as HTMLElement).innerText = `${tracks.length} songs`;
            (summaryEl.querySelector("span") as HTMLElement).innerText = `Average rating: ${Math.floor((totalRating / tracks.length) * 10) / 10}`; // i hope this is trustworthy
        }
    }

    if (songsEl) {
        // improve for artist view
        if (albumName && albumName !== "") {
            songsEl.innerHTML = tracks.map((t: any, idx: number) => {
                return `<li>${idx + 1}. ${t.title} [${t.rating}/5]</li>`;
            }).join('');
        } else {
            songsEl.innerHTML = tracks.map((t: any) => {
                return `<li><img src="${t.cover}" alt="{${t.album}}">${t.title} (${t.album} • ${t.rating}/5)</li>`;
            }).join('');
        }
    }

    const canvas = document.getElementById('album-chart-canvas') as HTMLCanvasElement | null;
    if (canvas && typeof (window as any).Chart !== 'undefined') {
        if ((window as any)._albumChartInstance) {
            try { (window as any)._albumChartInstance.destroy(); } catch (e) { }
            (window as any)._albumChartInstance = null;
        }

        (window as any)._albumChartInstance = new (window as any).Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ["1", "2", "3", "4", "5"],
                datasets: [{
                    label: 'Rating',
                    data: ratings,
                    backgroundColor: 'rgba(255,215,0,0.8)'
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    //x: { min: 0, max: 5 }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    MicroModal.show('modal-1');
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

    const newMusicChallengeData = ((await (await fetch("/api/songs")).json()) as Record<string, MusicChallengeSong[]>)["2026"] ?? [];

    (document.querySelector(".music-challenge-table tbody") as HTMLElement).innerHTML = newMusicChallengeData.map((song: MusicChallengeSong) => {
        return `
            <tr data-song-name="${song.title}" data-artist-name="${song.artist}" data-album-name="${song.album}">
                <td class="song-cover">
                    <img src="${song.cover}" alt="${song.album}" loading="lazy" />
                </td>
                <td class="song-info">
                    <h4 class="title">${song.title}</h4>
                    <span class="artist song-artist">${song.artist}</span>
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

    tableBody.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        const albumCell = target.closest(".song-album") as HTMLElement | null;
        const artistCell = target.closest(".song-artist") as HTMLElement | null;
        if (!albumCell && !artistCell) return;

        const row = (albumCell ?? artistCell)?.closest("tr");
        if (!row) return;

        const artist = row.getAttribute("data-artist-name") ?? "",
            album = albumCell ? (row.getAttribute("data-album-name") ?? "") : "";

        void showModal(
            artist,
            album,
            (row.querySelector(".song-cover img") as HTMLImageElement | null)?.src ?? ""
        );
    });

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
            <div class="card song-card-mini" data-embed-url="${result ? result.embed_url : null}" data-album-name="${album.name}" data-artist-name="${album.artist.name}" data-album-cover="${album.image[3]["#text"]}">
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
