const page = document.body.dataset.page;
const navLinks = document.querySelectorAll("nav a[data-page]");

navLinks.forEach((link) => {
  link.classList.toggle("active", link.dataset.page === page);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    }
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
