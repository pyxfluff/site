// pyxfluff 2025

(async () => {
    const statusResponse = await ((await fetch("https://statuspage.pyxfluff.dev/api/status")).json())

    console.log(statusResponse)

    let finalGlance = ""
    for (const [service, status] of Object.entries(statusResponse.urls) as [string, {
        name: string;
        url: string;
        status: string;
        latency: number;
    }][]) {
        console.log(service, status);
        finalGlance += `
        <div class="card status-card">
            <div class="status-service">
            <div class="status-title"><span class="status-title">${status.name}</span></div>
                <div class="status-meta">
                    <div class="status-orb ${status.status}"></div><span> ${status.status} · ${status.latency}ms</span>
                </div>
            </div>
        </div>
        `
    }

    document.getElementById("status-class-grid").innerHTML = finalGlance
})()
