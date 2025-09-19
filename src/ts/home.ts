// pyxfluff 2025

const badgeContainer = document.querySelector("#f88x31 div");
const badgeContainer2 = document.querySelector("#f88x31_2 div");

function shuffle(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

const shuffled = shuffle(window.BADGES);
const half = Math.floor(shuffled.length / 2);
const firstHalf = shuffled.slice(0, half);
const secondHalf = shuffled.slice(half, half * 2);

if (badgeContainer) {
    badgeContainer.innerHTML = firstHalf.map(path => `<img src="/images/88x31/${path}">`).join("");
}

if (badgeContainer2) {
    badgeContainer2.innerHTML = secondHalf.map(path => `<img src="/images/88x31/${path}">`).join("");
}


if (window.mobileCheck()) {
    document.body.classList.add("mobile");

    (document.getElementById("rain-audio") as HTMLAudioElement).src = "";
}

if ((new URLSearchParams(window.location.search)).get("isOldDomain") == "true") {
    document.body.classList.add("old_domain");
}

(document.querySelector(".music-display") as HTMLElement).addEventListener("click", () => {
    (document.querySelector(".music-display") as HTMLElement).style.position = "unset";
    (document.querySelector(".music-display .embed") as HTMLElement).innerHTML = ""
});
