// pyxfluff 2025 - 2026

document.addEventListener("DOMContentLoaded", () => {
  let increment = 0;
  let drops = "";
  let backDrops = "";

  while (increment < 100) {
    const randoHundo = Math.floor(Math.random() * 98) + 1;
    const randoFiver = Math.floor(Math.random() * 4) + 2; // (2-5)
    const bottomValue = randoFiver * 2 - 1 + 100;
    const animationDelay = `0.${randoHundo}s`;
    const animationDuration = `0.5${randoHundo}s`;

    increment += randoFiver;

    const dropTemplate = (position) => `
      <div class="drop" style="${position}: ${increment}%; bottom: ${bottomValue};">
        <div class="stem"></div>
        <div class="splat"></div>
      </div>`;

    drops += dropTemplate("left");
    backDrops += dropTemplate("right");
  }

  const rainFront = document.querySelector(".rain-front");
  const rainBack = document.querySelector(".rain-back");

  if (rainFront) rainFront.innerHTML = drops;

  if (rainBack) rainBack.innerHTML = backDrops;

  if (rainAudio) rainAudio.volume = 0.07;
});

document.addEventListener("mousedown", () => {
  if (mouseNudge) mouseNudge.style.display = "none";
  rainAudio?.play().catch(console.error); // Don't throw an unhandled promise rejection please!!
});
