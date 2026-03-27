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

function applyInlineBold(target, text) {
  const pattern = /\*\*(.+?)\*\*/g;
  let cursor = 0;
  let match = pattern.exec(text);

  while (match) {
    if (match.index > cursor) {
      target.appendChild(document.createTextNode(text.slice(cursor, match.index)));
    }

    const strong = document.createElement("strong");
    strong.textContent = match[1];
    target.appendChild(strong);

    cursor = match.index + match[0].length;
    match = pattern.exec(text);
  }

  if (cursor < text.length) {
    target.appendChild(document.createTextNode(text.slice(cursor)));
  }
}

function stripBoldWrapper(line) {
  return line.trim().replace(/^\*\*|\*\*$/g, "");
}

function parseNumberedLine(line) {
  const clean = stripBoldWrapper(line);
  const match = clean.match(/^(\d+)(?:\.(\d+))?\.?\s+(.+)$/);
  if (!match) return null;
  return {
    major: Number.parseInt(match[1], 10),
    minor: typeof match[2] !== "undefined" ? Number.parseInt(match[2], 10) : null,
    body: match[3].trim(),
  };
}

function isNumberedHeadingLine(line) {
  const clean = stripBoldWrapper(line);
  if (!clean) return false;

  const parsed = parseNumberedLine(clean);
  if (!parsed) return false;
  const { body } = parsed;

  // Sentences like "5.2 was ... It was ..." should stay body text.
  const sentenceCount = (body.match(/[.!?](?=\s|$)/g) || []).length;
  if (sentenceCount > 1) return false;

  // Numbered headings should render as headings by default.
  // List context and explicit force-body rules are handled elsewhere.
  return true;
}

function lineToHeadingText(line) {
  return stripBoldWrapper(line);
}

function renderVerbatimForDisplay() {
  const blocks = document.querySelectorAll(".verbatim-source-text");
  if (!blocks.length) return;

  blocks.forEach((pre) => {
    const text = pre.textContent.replace(/\r\n?/g, "\n");
    const lines = text.split("\n");
    const forcedBody = new Set(
      (pre.dataset.forceBodyLines || "")
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean)
    );
    const wrapper = document.createElement("div");
    wrapper.className = "verbatim-rendered";

    let currentList = null;

    const flushList = () => {
      if (currentList) {
        wrapper.appendChild(currentList);
        currentList = null;
      }
    };

    lines.forEach((raw) => {
      const line = raw.replace(/\t/g, "  ");
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        const gap = document.createElement("div");
        gap.className = "verbatim-gap";
        wrapper.appendChild(gap);
        return;
      }

      if (trimmed === "⸻") {
        flushList();
        // Keep source separators but do not render horizontal rules.
        return;
      }

      const bullet = trimmed.match(/^•\s+(.+)$/);
      if (bullet) {
        if (!currentList) {
          currentList = document.createElement("ul");
          currentList.className = "verbatim-list";
        }
        const li = document.createElement("li");
        applyInlineBold(li, bullet[1]);
        currentList.appendChild(li);
        return;
      }

      flushList();

      if (!forcedBody.has(trimmed) && isNumberedHeadingLine(trimmed)) {
        const heading = document.createElement("h3");
        heading.className = "part-title verbatim-heading";
        applyInlineBold(heading, lineToHeadingText(trimmed));
        wrapper.appendChild(heading);
        return;
      }

      const p = document.createElement("p");
      p.className = "verbatim-line";
      applyInlineBold(p, line);
      wrapper.appendChild(p);
    });

    flushList();
    pre.replaceWith(wrapper);
  });
}

renderVerbatimForDisplay();
