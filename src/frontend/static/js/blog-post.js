// pyxfluff 2026

// Automatically generated
DiscourseEmbed = {
  discourseUrl: "https://discourse.pyxfluff.dev/",
  discourseEmbedUrl: `https://pyxfluff.dev/blog/${document.querySelector(".blog-post").dataset.post_id}`,
  fullApp: true,
  embedHeight: "400px"
};

(function () {
  var d = document.createElement("script");
  d.type = "text/javascript";
  d.async = true;
  d.src = DiscourseEmbed.discourseUrl + "javascripts/embed.js";
  (
    document.getElementsByTagName("head")[0] ||
    document.getElementsByTagName("body")[0]
  ).appendChild(d);
})();
