// Forked code (partially; i fixed it), not mine lmao.

document.addEventListener("DOMContentLoaded", () => {
    var increment = 0;
    var drops = "";
    var backDrops = "";

    while (increment < 100) {
        var randoHundo = (Math.floor(Math.random() * (98 - 1 + 1) + 1));
        var randoFiver = (Math.floor(Math.random() * (5 - 2 + 1) + 2));

        increment += randoFiver;

        drops += '<div class="drop" style="left: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
        backDrops += '<div class="drop" style="right: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
    }

    document.querySelector('.rain-front').innerHTML = drops;
    document.querySelector('.rain-back').innerHTML = backDrops;

    document.getElementById("rain-audio").volume = .07;
    document.addEventListener("mousedown", () => {
        document.getElementById("mouse-nudge").style.display = "none";
        document.getElementById("rain-audio").play();
    })
    
});

