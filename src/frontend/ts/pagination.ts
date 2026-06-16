// pyxfluff 2025

// instantly load home
(async => {
    window.addEventListener("DOMContentLoaded", async () => {
        (document.getElementById("contentBody") as HTMLElement).innerHTML = await fetch("/pages/index").then((resp) => {
            return resp.text()
        });
    });
})();
