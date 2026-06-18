// pyxfluff 2026

(async () => {
    console.log(document.querySelector(".blog .blog-grid"))

    const blogLatest = await (await fetch("/api/blog/latest")).json();

    (document.querySelector(".blog .blog-grid") as HTMLElement).innerHTML = blogLatest.topic_list.topics.map((entry) => {
        return `
        <div class="post" data-post-id="${entry.id}">
            <div class="title-block">
                <h2 class="header">${entry.title}</h2>
                <div class="meta">
                    <span class="date-block">${entry.created_at} &bullet;</span>
                    <span class="tags unimportant">${entry.tags.map((tag) => { return `${tag.name}, ` })}</span>
                </div>
            </div>
            <p class="post-content">
                ${entry.excerpt}
            </p>
        </div>
        `
    })
})();
