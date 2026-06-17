"use strict";
document.addEventListener("DOMContentLoaded", () => {
    let increment = 0;
    let drops = "";
    let backDrops = "";
    while (increment < 100) {
        const randoHundo = Math.floor(Math.random() * 98) + 1;
        const randoFiver = Math.floor(Math.random() * 4) + 2; // (2-5)
        increment += randoFiver;
        const bottomValue = randoFiver * 2 - 1 + 100;
        const animationDelay = `0.${randoHundo}s`;
        const animationDuration = `0.5${randoHundo}s`;
        const dropTemplate = (position) => `
            <div class="drop" style="${position}: ${increment}%; bottom: ${bottomValue}%; 
                animation-delay: ${animationDelay}; animation-duration: ${animationDuration};">
                <div class="stem" style="animation-delay: ${animationDelay}; animation-duration: ${animationDuration};"></div>
                <div class="splat" style="animation-delay: ${animationDelay}; animation-duration: ${animationDuration};"></div>
            </div>`;
        drops += dropTemplate("left");
        backDrops += dropTemplate("right");
    }
    const rainFront = document.querySelector(".rain-front");
    const rainBack = document.querySelector(".rain-back");
    const rainAudio = document.getElementById("rain-audio");
    const mouseNudge = document.getElementById("mouse-nudge");
    if (rainFront)
        rainFront.innerHTML = drops;
    if (rainBack)
        rainBack.innerHTML = backDrops;
    if (rainAudio)
        rainAudio.volume = 0.07;
    document.addEventListener("mousedown", () => {
        if (mouseNudge)
            mouseNudge.style.display = "none";
        rainAudio?.play().catch(console.error); // Don't throw an unhandled promise rejection please!!
    });
});
