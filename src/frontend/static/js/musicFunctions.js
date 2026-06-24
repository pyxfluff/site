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
  const ratingsMap = {};

  tracks.forEach((t) => {
    if (t && t.title) ratingsMap[t.title] = t.rating || 0;
  });

  // Average for whole album
  let totalRating = 0;
  tracks.forEach((t) => {
    totalRating += t.rating || 0;
  });

  const averageRating = tracks.length ? Math.floor((totalRating / tracks.length) * 10) / 10 : 0;
  const titleText = document.getElementById("modal-title-text");
  const modalCoverSmall = document.getElementById("modal-cover-small");
  const coverEl = document.getElementById("album-cover");
  const songsEl = document.getElementById("album-songs");
  const summaryEl = document.getElementById("album-summary");

  if (albumName && albumName !== "") {
    if (titleText) titleText.textContent = `Details - ${albumName}`;
    if (modalCoverSmall) modalCoverSmall.src = cover || (tracks[0] && tracks[0].cover) || "";
    if (coverEl) coverEl.src = cover || (tracks[0] && tracks[0].cover) || "";
    if (summaryEl) {
      const h2 = summaryEl.querySelector("h2");
      const h4 = summaryEl.querySelector("h4");
      const span = summaryEl.querySelector("span");
      if (h2) h2.innerText = albumName;
      if (h4) h4.innerText = artist;
      if (span) span.innerText = `${tracks[0] && tracks[0].year ? tracks[0].year : ''} • Average Rating: ${averageRating}`;
    }
  } else {
    if (titleText) titleText.textContent = `${artist} - Summary`;
    if (modalCoverSmall) modalCoverSmall.src = cover || (tracks[0] && tracks[0].cover) || "";
    if (coverEl) coverEl.src = cover || (tracks[0] && tracks[0].cover) || "";
    if (summaryEl) {
      const h2 = summaryEl.querySelector("h2");
      const h4 = summaryEl.querySelector("h4");
      const span = summaryEl.querySelector("span");
      if (h2) h2.innerText = artist;
      if (h4) h4.innerText = `${tracks.length} songs`;
      if (span) span.innerText = `Average rating: ${averageRating}`;
    }
  }

  if (songsEl) {
    if (albumName && albumName !== "") {
      songsEl.innerHTML = tracks.map((t, idx) => `<li>${idx + 1}. ${t.title} [${t.rating || 0}/5]</li>`).join("");
    } else {
      songsEl.innerHTML = tracks
        .map((t) => `<li><img src="${t.cover}" alt="${t.album}" loading="lazy">${t.title} (${t.album} • ${t.rating || 0}/5)</li>`)
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
        labels: Object.keys(ratingsMap),
        datasets: [
          {
            label: "Rating",
            data: Object.values(ratingsMap),
            backgroundColor: "rgba(255, 215, 0, 0.8)"
          }
        ]
      },
      options: {
        indexAxis: "y",
        scales: { x: {} },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  MicroModal.show("modal-1");
}

const initMusicPage = async () => {
  if (!enableMusicPull) return null;
  try {
    const [tracksRes, albumsRes] = await Promise.all([
      fetch("https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&format=json&limit=10&period=1month"),
      fetch("https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=pyxfluff&api_key=974a5ebc077564f72bd639d122479d4b&format=json&limit=10&period=1month")
    ]);

    const tracksData = await tracksRes.json();
    const albumsData = await albumsRes.json();
    const tracks = (tracksData && tracksData.toptracks && tracksData.toptracks.track) || [];
    const albums = (albumsData && albumsData.topalbums && albumsData.topalbums.album) || [];

    const songsApi = await (await fetch("/api/songs")).json();
    const newMusicChallengeData = songsApi["2026"] || [];

    document.querySelector(".music-challenge-table tbody").innerHTML = newMusicChallengeData
      .map((song) => `
            <tr data-song-name="${song.title}" data-artist-name="${song.artist}" data-album-name="${song.album}">
                <td class="song-cover">
                    <img src="${song.cover}" alt="${song.album}" loading="lazy" />
                </td>
                <td class="song-info">
                    <h4 class="title">${song.title}</h4>
                    <span class="artist">• ${song.artist}</span>
                </td>
                <td class="song-album">${song.album}</td>
                <td class="song-year">${song.year ? song.year : ''}</td>
                <td class="song-rating">${song.rating ? song.rating : ''}</td>
            </tr>
        `)
      .join("");

    const searchInput = document.getElementById("music-search-input");
    const searchClear = document.getElementById("music-search-clear");
    const tableBody = document.querySelector(".music-challenge-table tbody");

    if (searchInput && searchClear && tableBody) {
      const filterAndHighlight = () => {
        const query = searchInput.value.toLowerCase().trim();
        const rows = Array.from(tableBody.querySelectorAll("tr"));
        if (!query) {
          rows.forEach((row) => {
            row.style.display = "";
            row.querySelectorAll(".highlight").forEach((el) => el.classList.remove("highlight"));
          });
          return;
        }
        rows.forEach((row) => {
          const song = (row.getAttribute("data-song-name") || "").toLowerCase();
          const artist = (row.getAttribute("data-artist-name") || "").toLowerCase();
          const album = (row.getAttribute("data-album-name") || "").toLowerCase();
          const isMatch = song.includes(query) || artist.includes(query) || album.includes(query);
          if (isMatch) {
            row.style.display = "";
            const regex = new RegExp(`(${query})`, "gi");
            const cells = [row.querySelector(".song-info .title"), row.querySelector(".song-info .artist"), row.querySelector(".song-album")];
            cells.forEach((cell) => {
              if (cell) cell.innerHTML = (cell.textContent || "").replace(regex, "<span class='highlight'>$1</span>");
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

      // Make rows clickable to open album/artist modal
      const tableRows = document.querySelectorAll('.music-challenge-table tbody tr');
      tableRows.forEach((row) => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
          const artist = row.getAttribute('data-artist-name') || '';
          const album = row.getAttribute('data-album-name') || '';
          const coverImg = row.querySelector('.song-cover img');
          const cover = coverImg ? coverImg.src : '';
          if (album) showModal(artist, album, cover);
          else showModal(artist, '', cover);
        });
      });

    // Top songs / albums area: query backend YouTube proxy for exact video IDs
    const repeatSongsList = document.getElementById("repeat-songs-list");
    const repeatAlbumList = document.getElementById("repeat-album-list");

    if (repeatSongsList) {
      const queries = tracks.map((track) => {
        const artistName = (track && track.artist && track.artist.name) || "";
        return `${track.name} ${artistName}`;
      });

      let ytResults = [];
      try {
        const ytRes = await fetch("/api/youtube/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queries })
        });
        const ytJson = await ytRes.json();
        ytResults = ytJson.results || [];
      } catch (e) {
        ytResults = [];
      }

      repeatSongsList.innerHTML = tracks
        .map((track, i) => {
          const artistName = (track && track.artist && track.artist.name) || "";
          let art = "";
          try {
            if (track.image && track.image.length) art = track.image[track.image.length - 1]["#text"] || "";
          } catch (e) {
            art = "";
          }
          const res = ytResults[i] || {};
          const videoId = res.videoId;
          const thumb = res.thumbnail || art || "";
          const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent((track.name + ' ' + artistName)).replace(/%20/g, '+')}`;

          return `
            <div class="card song-card-mini song" data-embed-url="${embedUrl}">
                <div class="song-artwork">
                    <img class='art' src='${thumb}'>
                </div>
                <div class="song-info">
                    <div class="song-title"><span class="song-title">${track.name}</span></div>
                    <div class="artist">• ${artistName} · ${track.playcount || ''} plays</div>
                </div>
            </div>
            `;
        })
        .join("");

      repeatSongsList.querySelectorAll('.card.song-card-mini.song').forEach((el) => {
        el.addEventListener('click', (ev) => {
          const url = el.getAttribute('data-embed-url');
          const display = document.querySelector('.music-display');
          const embed = display && display.querySelector('.embed');
          if (embed && url) {
            embed.innerHTML = `<iframe width="800" height="450" src="${url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            display.classList.remove('hidden');
          }
        });
      });

      const musicDisplay = document.querySelector('.music-display');
      if (musicDisplay) {
        musicDisplay.addEventListener('click', (e) => {
          if (e.target === musicDisplay) {
            musicDisplay.classList.add('hidden');
            const embed = musicDisplay.querySelector('.embed');
            if (embed) embed.innerHTML = '';
          }
        });
      }
    }

    if (repeatAlbumList) {
      repeatAlbumList.innerHTML = albums.map((album) => `<li class="song album">${album.name || album.title || ''}</li>`).join("");
    }
  } catch (e) {
    console.error('initMusicPage error', e);
  }
};

initMusicPage();
