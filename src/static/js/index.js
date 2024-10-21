// pyxfluff 2024

function getCurrentTime() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric', 
        hour12: true, 
        timeZone: 'America/New_York' 
    };
    
    const dateInUtc = new Date();
    let estTime = dateInUtc.toLocaleString('en-US', options);

    const day = estTime.match(/\d{1,2}/)[0];
    const suffix = day.endsWith('1') && !day.endsWith('11') ? 'st' :
                   day.endsWith('2') && !day.endsWith('12') ? 'nd' :
                   day.endsWith('3') && !day.endsWith('13') ? 'rd' : 'th';

    estTime = estTime.replace(day, `${day}${suffix}`);
    
    return estTime;
}

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

setInterval(function() {
    document.getElementById("est-time").innerText = getCurrentTime();
}, 1000)

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