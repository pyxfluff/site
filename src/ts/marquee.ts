document.addEventListener("DOMContentLoaded", () => {
    const gap = 0;
    const amount = 1;
    const element = document.getElementById("f88x31") as HTMLElement;

    const box = element.querySelector("div") as HTMLElement;
    box.style.position = "relative";

    let left = 0, last = 0;
    function frame(time) {
        if (time - last >= 10) {
            // Calculate bounding boxes
            const truth = element.getBoundingClientRect().left;
            const rect = box.children[0].getBoundingClientRect();
        
            // Push left button to right side
            if ((rect.left + rect.width) <= truth) {
                box.appendChild(box.children[0]);
                left += rect.width + gap;
            }
        
            // Update box positioning
            box.style.left = `${left}px`;
            left -= amount;
            last = time;
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
});
