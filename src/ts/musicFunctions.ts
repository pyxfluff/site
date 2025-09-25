// pyxfluff 2025

const enableMusicPull = true;

async function setRecentlyPlaying(): Promise<undefined> {
    let res = await fetch("https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&limit=1&page=1&format=json");
    let track = (await res.json()).recenttracks.track[0];
    let artStyle = document.getElementById("song_art")?.style;

    const songName = document.getElementById("song_name");
    const songMeta = document.getElementById("song_meta");
    if (songName) songName.innerText = track.name;
    if (songMeta) songMeta.innerText = `${track.artist["#text"]} · ${track.album["#text"]}`;
    if (artStyle) {
        Object.assign(artStyle, {
            background: `url("${track.image[3]["#text"]}") center/cover no-repeat`
        });
    }
}

const initMusicPage = (async () => {
    if (!enableMusicPull) return null;

    await setRecentlyPlaying();

    const [tracksRes, albumsRes] = await Promise.all([
        fetch("https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&format=json&limit=10&period=1month"),
        fetch("https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&format=json&limit=10&period=1month")
    ]);

    let tracks = (await tracksRes.json()).toptracks.track;
    let albums = (await albumsRes.json()).topalbums.album;

    // load music challenge before the page gets too slow
    const musicChallengeData = await (await fetch("/data/music_challenge.json")).json()

    document.getElementById("music-challenge").innerText = musicChallengeData.data

    const searchResults = await (await fetch("https://spotifysvc.pyxfluff.dev/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify([...tracks.map(track => ({ name: track.name, artist: track.artist.name }))])
    })).json();

    const repeatSongsList = document.getElementById("repeat-songs-list");
    const repeatAlbumList = document.getElementById("repeat-album-list");

    if (repeatSongsList) {
        repeatSongsList.innerHTML = await Promise.all(tracks.map(async (track) => {
            let result = searchResults.find(res => res.title === track.name);

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
        repeatAlbumList.innerHTML = albums.map((album) => {
            const result = searchResults.find(res => res.title === album.name && res.artist === album.artist.name);

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

setInterval(setRecentlyPlaying, 15000);
