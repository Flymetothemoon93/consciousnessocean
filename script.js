const page = document.body.dataset.page;
const navLinks = document.querySelectorAll("nav a[data-page]");

navLinks.forEach((link) => {
  link.classList.toggle("active", link.dataset.page === page);
});

const revealTargets = document.querySelectorAll(".reveal");

if (!("IntersectionObserver" in window)) {
  revealTargets.forEach((el) => el.classList.add("show"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      }
    },
    {
      threshold: [0, 0.01],
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
}
