// Copyright (c) 2025 iiPython
// Marquee88 - Infinite marquee system for 88x31 buttons
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const gap = 20;
        const amount = 1;
        const element = document.getElementById("f88x31") as HTMLElement;

        const box = element.querySelector("div") as HTMLElement;

        box.style.position = "relative";

        let left = 0, last = 0;
        function frame(time) {
            if (time - last >= 10) {
                const truth = element.getBoundingClientRect().left;
                const rect = box.children[0].getBoundingClientRect();

                if ((rect.left + rect.width) <= truth) {
                    box.appendChild(box.children[0]);
                    left += rect.width + gap;
                }

                box.style.left = `${left}px`;
                left -= amount;
                last = time;
            }
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }, 100)
});
