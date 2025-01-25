// pyxfluff 2024 - 2025

const eightyeightbythirtyone = [
    "3dot5mmfc-button",
    "antinft",
    "anythingbut",
    "archlinux",
    "built_notepad",
    "chrmevil",
    "coke",
    "cyberdog",
    "fckfb",
    "fckgoogle",
    "ffmpeg",
    "fftake",
    "foobar2000",
    "hi",
    "ieburnbtn",
    "internetprivacy",
    "kdenews",
    "linux",
    "mac-works",
    "masto",
    "microsoft_stop",
    "paws",
    "plasma",
    "proxmox",
    "switch_now",
    "telegram-old",
    "visitmini",
    "vscbutton"
]

// Tabbing
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.nav button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function switchTab(tabId) {
        const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
        const selectedPane = document.getElementById(tabId);
        
        tabs.forEach(tab => tab.classList.remove('selected'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        if (selectedTab && selectedPane) {
            selectedTab.classList.add('selected');
            selectedPane.classList.add('active');
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Load 88x31s
    var finalData = "";

    eightyeightbythirtyone.forEach((path) => {
        finalData += `<img src="/images/88x31/${path}.gif">  `
    });

    finalData += `<span style='opacity: 0'>${"W".repeat(50)}</span>`; // spacer

    document.getElementById("f88x31").innerHTML = finalData;
});

async function fetchTracks() {
    // This is not my API key, don't tell me I leaked it
    let resp = await fetch("https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&limit=1&page=1&format=json");
    let json = await resp.json();
    let track = json.recenttracks.track[0]
    let artStyle = document.getElementById("song_art").style;

    document.getElementById("song_name").innerText = track.name
    document.getElementById("song_meta").innerText = `${track.artist["#text"]} · ${track.album["#text"]}`
    artStyle.background = `url("${track.image[3]["#text"]}")`
    artStyle.backgroundSize = "cover";
    artStyle.backgroundRepeat = "no-repeat";
    artStyle.backgroundPosition = "center";
}

setInterval(async function() {
    await fetchTracks();
}, 15000)

const trigger = async () => { // run jobs instantly
    await fetchTracks();

    let topTracks = await fetch("https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&format=json&limit=5&period=1month");
    let json = await topTracks.json()

    console.log(json)

    json.toptracks.track.forEach(track => {
        console.log(track)
        let artStyle = document.getElementById(`song_art_${track["@attr"].rank}`).style;

        document.getElementById(`song_name_${track["@attr"].rank}`).innerText = track.name
        document.getElementById(`song_meta_${track["@attr"].rank}`).innerText = `${track.artist.name} · ${track.playcount} plays`
        artStyle.background = `url("${track.image[3]["#text"]}")`
        artStyle.backgroundSize = "cover";
        artStyle.backgroundRepeat = "no-repeat";
        artStyle.backgroundPosition = "center";
    });
}

trigger();
