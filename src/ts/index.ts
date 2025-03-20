// pyxfluff 2024 - 2025

const enableMusicPull = true;

const badgeList = [
    "3dot5mmfc-button", "antinft", "anythingbut", "archlinux", "built_notepad", "chrmevil", "coke",
    "cyberdog", "fckfb", "fckgoogle", "ffmpeg", "fftake", "foobar2000", "hi", "ieburnbtn", "internetprivacy",
    "kdenews", "linux", "mac-works", "masto", "microsoft_stop", "paws", "proxmox", "switch_now",
    "telegram-old", "visitmini", "vscbutton"
];

function mobileCheck() {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent);
    return check;
};

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav button").forEach(tab => {
        tab.addEventListener("click", () => {
            const pane = document.getElementById(tab.getAttribute("data-tab")!);

            document.querySelectorAll(".nav button, .tab-pane").forEach(el => el.classList.remove("selected", "active"));
            tab.classList.add("selected");

            if (pane) pane.classList.add("active");
        });
    });

    const badgeContainer = document.querySelector("#f88x31 div");
    if (badgeContainer) {
        badgeContainer.innerHTML = badgeList.map(path => `<img src="/images/88x31/${path}.gif">`).join(" ");
    }

    if (mobileCheck()) {
        document.body.classList.add("mobile");

        (document.getElementById("rain-audio") as HTMLAudioElement).src = "";
    }

    const urlParams = new URLSearchParams(window.location.search);

    console.log(urlParams.get("isOldDomain") === "true", urlParams)

    if (urlParams.get("isOldDomain") == "true") {
        document.body.classList.add("old_domain");
    }

    (document.querySelector(".music-display") as HTMLElement).addEventListener("click", () => {
        (document.querySelector(".music-display") as HTMLElement).style.position = "unset";
        (document.querySelector(".music-display .embed") as HTMLElement).innerHTML = ""
    })
});

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

setInterval(setRecentlyPlaying, 15000);

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

const trigger = async (): Promise<null> => {
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
                <div class="card song-card-mini" data-embed-url="${result ? result.embed_url : null}">
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
    const cards = document.querySelectorAll(".card.song-card-mini");
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

    return null;
};



trigger();
