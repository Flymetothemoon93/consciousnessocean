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
  const { major, body } = parsed;
  const hasDecimal = parsed.minor !== null;

  // Sentences like "5.2 was ... It was ..." should stay body text.
  const sentenceCount = (body.match(/[.!?](?=\s|$)/g) || []).length;
  if (sentenceCount > 1) return false;

  // Keep early enumerations like "1. Stable self-generation" as body text.
  if (!hasDecimal) {
    const endsWithPunctuation = /[.:!?]$/.test(body);
    if (major <= 3 && !endsWithPunctuation) return false;
    return endsWithPunctuation || major >= 4;
  }

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
    let listMode = false;
    let listNextMajor = null;
    let previousSignificantLine = "";

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
        listMode = false;
        listNextMajor = null;
        // Keep source separators but do not render horizontal rules.
        previousSignificantLine = "";
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
        listMode = false;
        listNextMajor = null;
        previousSignificantLine = trimmed;
        return;
      }

      flushList();

      let forceBodyByContext = false;
      const parsed = parseNumberedLine(trimmed);
      if (parsed) {
        const prev = stripBoldWrapper(previousSignificantLine);
        const startsNumberedList = /:\s*$/.test(prev);

        if (startsNumberedList) {
          listMode = true;
          listNextMajor = parsed.major + 1;
          forceBodyByContext = true;
        } else if (listMode && parsed.minor === null && listNextMajor !== null && parsed.major === listNextMajor) {
          listNextMajor += 1;
          forceBodyByContext = true;
        } else if (!(listMode && parsed.minor === null && listNextMajor !== null)) {
          listMode = false;
          listNextMajor = null;
        }
      } else if (listMode) {
        listMode = false;
        listNextMajor = null;
      }

      if (!forcedBody.has(trimmed) && !forceBodyByContext && isNumberedHeadingLine(trimmed)) {
        const heading = document.createElement("h3");
        heading.className = "part-title verbatim-heading";
        applyInlineBold(heading, lineToHeadingText(trimmed));
        wrapper.appendChild(heading);
        previousSignificantLine = trimmed;
        return;
      }

      const p = document.createElement("p");
      p.className = "verbatim-line";
      applyInlineBold(p, line);
      wrapper.appendChild(p);
      previousSignificantLine = trimmed;
    });

    flushList();
    pre.replaceWith(wrapper);
  });
}

renderVerbatimForDisplay();
