document.addEventListener("DOMContentLoaded", () => {
    const gap = 0;
    const amount = 1;
    const element = document.getElementById("f88x31") as HTMLElement;
    const element2 = document.getElementById("f88x31_2") as HTMLElement;

    const box = element.querySelector("div") as HTMLElement;
    box.style.position = "relative";

    const box2 = element2.querySelector("div") as HTMLElement;
    box2.style.position = "relative";

    let left = 0, last = 0;
    let left2 = 0, last2 = 0;

    function frame(time) {
        if (time - last >= 10) {
            const truth = element.getBoundingClientRect().left;
            const truth2 = element2.getBoundingClientRect().left;

            const rect = box.children[0].getBoundingClientRect();
            const rect2 = box2.children[0].getBoundingClientRect();

            if ((rect.left + rect.width) <= truth) {
                box.appendChild(box.children[0]);
                left += rect.width + gap;
            }

            if ((rect2.left + rect2.width) <= truth2) {
                box2.appendChild(box2.children[0]);
                left2 += rect2.width + gap;
            }

            // Update box positioning
            box.style.left = `${left}px`;
            left -= amount;
            last = time;

            box2.style.left = `${left2}px`;
            left2 -= amount;
            last2 = time;
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
});
