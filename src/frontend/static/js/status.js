// pyxfluff 2025 - 2026

(async () => {
  const data = await (
    await fetch("https://kuma.pyxfluff.dev/api/status-page/heartbeat/services")
  ).json();

  const incidents = await (
    await fetch("https://kuma.pyxfluff.dev/api/status-page/services")
  ).json();

  const records = data.heartbeatList;
  //const ticks = (window.mobileCheck() && 60) || 175;
  const ticks = 100;

  // associate stuff with its data!!! :3
  let services = {};
  for (const statusEntry of incidents.publicGroupList[0].monitorList) {
    services[statusEntry.name] = {
      name: statusEntry.name,
      id: statusEntry.id,
      heartbeats: data.heartbeatList[statusEntry.id],
      uptimePercent: data.uptimeList[`${statusEntry.id}_24`], // literally why the fuck /????????
      online: data.heartbeatList[statusEntry.id][99].status === 1
    };
  }

  // why did i write this one differently than how the blog and music page work???????
  document.getElementById("service-grid").innerHTML = "";

  console.log(services);

  for (let statusEntry in services) {
    statusEntry = services[statusEntry];
    const el = document.createElement("div");

    el.className = "statuspage-service";
    el.innerHTML = `
        <div class="status-title"><span class="status-title">${statusEntry.name}</span></div>
            <div class="status-meta">
                <div class="status-orb ${statusEntry.warning != undefined ? "warn" : statusEntry.online ? "up" : "down"}"></div>
                <span>${statusEntry.warning != undefined ? "<strong>Degraded</strong>" : statusEntry.online ? "Online" : "<strong>Offline</strong>"} (${statusEntry.heartbeats[99].ping ?? "0"}ms)
                    ${statusEntry.warning != undefined ? `<i class="status-warn">${statusEntry.warning}</i>` : ""}
                </span>
            </div>
        <div class="status-ticks"></div>
      `;

    for (let i = 0; i < ticks; i++) {
      const tick = document.createElement("div");

      tick.className = `tick ${statusEntry.heartbeats[i]?.status !== 1 ? "down" : "up"}`;
      tick.title = `${statusEntry.heartbeats[i]?.ping}ms latency`;

      el.querySelector(".status-ticks").appendChild(tick);
    }

    document.getElementById("service-grid").appendChild(el);
  }

  // load incidents
  const realIncidents = incidents.maintenanceList;
  const issues = document.querySelector(".known-issues");
  issues.innerHTML = "";

  if (realIncidents == []) {
    issues.innerHTML = `
      <i data-lucide="check"></i> <span class = "no-incidents-notice">All clear! No known issues.</span>
    `;

    issues.classList.add("all-is-oki");
  } else {
    issues.innerHTML = `
      <i data-lucide="triangle-alert"></i> <span>Active Incident</span>
      <h2>${realIncidents[0].title}</h2>
      <span>${realIncidents[0].description}</span>
    `;

    issues.classList.add("shits-going-down");
  }

  lucide.createIcons();
})();
