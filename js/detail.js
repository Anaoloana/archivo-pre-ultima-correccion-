const authorTrack = document.querySelector(".author-track");
const authorDots = Array.from(document.querySelectorAll(".author-dots span"));

if (authorTrack && authorDots.length) {
  authorTrack.addEventListener("scroll", () => {
    const activeIndex = Math.round(authorTrack.scrollLeft / authorTrack.clientWidth);
    authorDots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
  }, { passive: true });
}
