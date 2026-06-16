// pyxfluff 2025

(async () => {
    const data = await (await fetch("https://statuspage.pyxfluff.dev/api/status")).json();

    const records = data.records;
    const services = Object.keys(records.at(-1).services);
    const ticks = window.mobileCheck() && 60 || 175

    for (const name of services) {
        const status = records.at(-1).services[name];
        const meta = data.urls[name];

        const el = document.createElement("div");
        el.className = "statuspage-service";
        el.innerHTML = `
        <div class="status-title"><span class="status-title">${name}</span></div>
            <div class="status-meta">
                <div class="status-orb ${meta.warning != undefined ? "warn" : (status.online ? "up" : "down")}"></div>
                <span>${meta.warning != undefined ? "<strong>Degraded</strong>" : (status.online ? "Online" : "<strong>Offline</strong>")} (${status.latency}ms)
                    ${meta.warning != undefined ? `<i class="status-warn">${meta.warning}</i>` : ""} 
                </span>
            </div>
        <div class="status-ticks"></div>
      `;

        const size = Math.floor(records.length / ticks);

        for (let i = 0; i < ticks; i++) {
            const tick = document.createElement("div");
            tick.className = `tick ${records.slice(i * size, (i + 1) * size).some(r => r.services[name]?.online === false) ? "down" : "up"}`;

            el.querySelector(".status-ticks")!.appendChild(tick);
        }

        document.getElementById("service-grid")!.appendChild(el);
    }
})();
