// pyxfluff 2025


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


async function getArt(
    trackMbid: string,
    title: string,
    artistMbid: string
): Promise<string | null> {
    let res = await fetch(`https://corsproxy.io?https://musicbrainz.org/ws/2/recording/${trackMbid}?inc=releases&fmt=json`).catch(() => {
        return null;
    });

    if (res == null || res.status == 503) {
        return null;
    }

    if (!res.ok) {
        let searchData = await (await fetch(`https://corsproxy.io?https://musicbrainz.org/ws/2/recording?query=recording:"${encodeURIComponent(title)}" AND arid:${artistMbid}&fmt=json`)).json();

        trackMbid = searchData.recordings?.[0]?.id;
        if (!trackMbid) return null;

        res = await fetch(`https://corsproxy.io?https://musicbrainz.org/ws/2/recording/${trackMbid}?inc=releases&fmt=json`).catch(() => {
            return null;
        });
    }

    let data = await (res || { json: () => { } }).json();

    return data.releases?.[0]?.id ? `https://coverartarchive.org/release/${data.releases[0].id}/front-250` : null;
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
            let art = await getArt(track.mbid, track.name, track.artist.mbid);
            let result = searchResults.find(res => res.title === track.name);

            return `
            <div class="card song-card-mini song" data-embed-url="${result ? result.embed_url : null}">
            <div class="song-artwork"><img class='art' src='${art}'></div>
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
            <div class="song-artwork"><img class='art' src='${album.image[3]["#text"]}'></div>
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
            (document.querySelector(".music-display") as HTMLElement).style.position = "absolute"

            if (embedUrl) {
                (document.querySelector(".music-display .embed") as HTMLElement).innerHTML = `<iframe style="border-radius:12px" src="${embedUrl}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
            } else {
                console.log("No embed URL available.");
            }
        });
    });
});

setInterval(setRecentlyPlaying, 15000);
