// pyxfluff 2025 - 2026
const enableMusicPull = true;

if (typeof MicroModal !== "undefined") {
  MicroModal.init({
    awaitOpenAnimation: true,
    awaitCloseAnimation: true,
    disableScroll: true
  });
}

async function getTracks(artist, albumName) {
  try {
    // Good luck to future me
    const vals = Object.values(await (await fetch("/api/songs")).json());
    if (albumName && albumName !== "")
      return vals
        .flat()
        .filter(
          (s) =>
            (s.album || "").toLowerCase() === albumName.toLowerCase() &&
            (s.artist || "").toLowerCase() === artist.toLowerCase()
        );
  } catch (e) {
    return [];
  }
}

async function showModal(artist, albumName, cover) {
  const tracks = await getTracks(artist, albumName);
  // Ratings and track order come from the local songs.json entries we fetched above
  const ratingsMap = {};
  tracks.forEach((t) => {
    if (t.title) ratingsMap[t.title] = t.rating ?? 0;
  });

  // Average for whole album
  let totalRating = 0;
  tracks.forEach((t) => {
    totalRating += t.rating;
  });

  const averageRating = Math.floor((totalRating / tracks.length) * 10) / 10;

  const titleText = document.getElementById("modal-title-text");
  const modalCoverSmall = document.getElementById("modal-cover-small");
  const coverEl = document.getElementById("album-cover");
  const songsEl = document.getElementById("album-songs");
  const summaryEl = document.getElementById("album-summary");

  if (albumName && albumName !== "") {
    if (titleText) titleText.textContent = `Details - ${albumName}`;
    if (modalCoverSmall)
      modalCoverSmall.src = cover || (tracks[0] && tracks[0].cover) || "";
    if (coverEl) coverEl.src = cover || (tracks[0] && tracks[0].cover) || "";
    if (summaryEl) {
      summaryEl.querySelector("h2").innerText = albumName;
      summaryEl.querySelector("h4").innerText = artist;
      summaryEl.querySelector("span").innerText =
        `${tracks[1].year} • Average Rating: ${averageRating}`; // I hope this is trustworthy
    }
  } else {
    if (titleText) titleText.textContent = `${artist} - Summary`;
    if (modalCoverSmall)
      modalCoverSmall.src = cover || (tracks[0] && tracks[0].cover) || "";
    if (coverEl) coverEl.src = cover || (tracks[0] && tracks[0].cover) || "";
    if (summaryEl) {
      summaryEl.querySelector("h2").innerText = artist;
      summaryEl.querySelector("h4").innerText = `${tracks.length} songs`;
      summaryEl.querySelector("span").innerText =
        `Average rating: ${averageRating}`; // I hope this is trustworthy
    }
  }

  if (songsEl) {
    // Improve for artist view
    if (albumName && albumName !== "") {
      songsEl.innerHTML = tracks
        .map((t, idx) => `<li>${idx + 1}. ${t.title} [${t.rating}/5]</li>`)
        .join("");
    } else {
      songsEl.innerHTML = tracks
        .map(
          (t) =>
            `<li><img src="${t.cover}" alt="${t.album}" loading="lazy">${t.title} (${t.album} • ${t.rating}/5)</li>`
        )
        .join("");
    }
  }

  const canvas = document.getElementById("album-chart-canvas");
  if (canvas && typeof window.Chart !== "undefined") {
    if (window._albumChartInstance) {
      try {
        window._albumChartInstance.destroy();
      } catch (e) {}
      window._albumChartInstance = null;
    }

    window._albumChartInstance = new window.Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["1", "2", "3", "4", "5"],
        datasets: [
          {
            label: "Rating",
            data: ratingsMap,
            backgroundColor: "rgba(255, 215, 0, 0.8)"
          }
        ]
      },
      options: {
        indexAxis: "y",
        scales: { x: {} }, // Remove x-axis for better readability
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  MicroModal.show("modal-1");
}

const initMusicPage = async () => {
  if (!enableMusicPull) return null;
  const [tracksRes, albumsRes] = await Promise.all([
    fetch(
      "https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&format=json&limit=10&period=1month"
    ),
    fetch(
      "https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&format=json&limit=10&period=1month"
    )
  ]);
  const tracks = (await tracksRes.json()).toptracks.track;
  const albums = (await albumsRes.json()).topalbums.album;

  // Load music challenge before the page gets too slow
  // TODO: We can probably remove the 2025 music challenge??? Or at least use the data better,
  //const musicChallengeData = await (await fetch("/data/music_challenge.json")).json()
  //document.getElementById("music-challenge").innerText = musicChallengeData.data

  const newMusicChallengeData =
    (await (await fetch("/api/songs")).json())["2026"] ?? [];

  document.querySelector(".music-challenge-table tbody").innerHTML =
    newMusicChallengeData
      .map((song) => {
        return `
            <tr data-song-name="${song.title}" data-artist-name="${song.artist}" data-album-name="${song.album}">
                <td class="song-cover">
                    <img src="${song.cover}" alt="${song.album}" loading="lazy" />
                </td>
                <td class="song-title">${song.name}</td>
                <td class="artist">• ${song.artist.name} · ${song.playcount} plays</td>
            </tr>
        `;
      })
      .join("");

  const repeatSongsList = document.getElementById("repeat-songs-list");
  const repeatAlbumList = document.getElementById("repeat-album-list");

  if (repeatSongsList) {
    repeatSongsList.innerHTML = await Promise.all(
      tracks.map(async (track) => {
        const result = searchResults.find((res) => res.title === track.name);
        return `
            <div class="card song-card-mini song" data-embed-url="${result ? result.embed_url : null}">
                <div class="song-artwork">
                    <img class='art' src='${result ? result.art : ""}'>
                </div>
                <div class="song-info">
                    <div class="song-title"><span class="song-title">${track.name}</span></div>
                    <div class="artist">• ${track.artist.name} · ${track.playcount} plays</div>
                </div>
            </div>
            `;
      })
    ).then((html) => html.join(""));
  }

  if (repeatAlbumList) {
    repeatAlbumList.innerHTML = albums
      .map((album) => `<li class="song album">${album.title}</li>`)
      .join("");
  }

  const canvas = document.getElementById("album-chart-canvas");
  if (canvas && typeof window.Chart !== "undefined") {
    if (window._albumChartInstance) {
      try {
        window._albumChartInstance.destroy();
      } catch (e) {}
      window._albumChartInstance = null;
    }

    window._albumChartInstance = new window.Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["1", "2", "3", "4", "5"],
        datasets: [
          {
            label: "Rating",
            data: ratingsMap,
            backgroundColor: "rgba(255, 215, 0, 0.8)"
          }
        ]
      },
      options: {
        indexAxis: "y",
        scales: { x: {} }, // Remove x-axis for better readability
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  MicroModal.show("modal-1");
};

initMusicPage();
