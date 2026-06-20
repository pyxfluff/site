// pyxfluff 2026
function formatDate(createdAt) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(createdAt));
}

(async () => {
    console.log(document.querySelector(".blog .blog-grid"));

    const blogLatest = await (await fetch("/api/blog/latest")).json();
    document.querySelector(".blog .blog-grid").innerHTML = blogLatest.topic_list.topics.map((entry) => {
        return `
        <div class="post" data-post-id="${entry.id}">
            <div class="title-block">
                <h2 class="header">${entry.title}</h2> <i data-lucide="arrow-right"></i>
                <div class="meta">
                    <span class="date-block">${formatDate(entry.created_at)} &bullet;</span>
                    <span class="tags unimportant">${entry.tags.map((tag) => tag.name).join(", ")}</span>
                </div>
            </div>
            <p class="post-content">
                ${entry.content.post_stream.posts[0].cooked.split("</p>")[0]} 
            </p>
        </div>
        `;
    });
    
    // lazy..
    lucide.createIcons();
})();
