const MAIN_COLOR = "#0CB345";
const ALT_COLOR = "transparent";
const TEXT_COLOR = "#ffffff";
const BUTTON_ACTION_TEXT = "Copied!";
const BUTTON_ACTION_WAIT_TIME = 1000;
const WAIT_TIME = 1000;

// Object containing button text and extra styles
const BUTTON_MAP = {
  copy: {
    text: "Copy",
    extra: "margin-right: 1rem; width: 80px;",
  },
  copyMarkdown: {
    text: "Copy Markdown",
    extra: "width: 128px;",
  },
  solution: {
    text: "Solution",
    extra: "margin-left: 1rem; width: 80px;",
  },
};

// Object containing html tags and their corresponding markdown syntax
const MARKDOWN = {
  "<div>": "",
  "</div>": "",
  "<p>": "",
  "</p>": "",
  "<u>": "",
  "</u>": "",
  "<ol>": "",
  "</ol>": "",
  "<ul>": "",
  "</ul>": "",
  "<li>": "- ",
  "</li>": "",
  "&nbsp;": "",
  "<em>": "",
  "</em>": "",
  "<strong>Input</strong>": "Input\n",
  "<strong>Output</strong>": "Output\n",
  "<strong>Explanation</strong>": "Explanation\n",
  "<strong>Input:</strong>": "Input:",
  "<strong>Output:</strong>": "Output:",
  "<strong>Explanation:</strong>": "Explanation:",
  "<strong>Input: </strong>": "Input: ",
  "<strong>Output: </strong>": "Output: ",
  "<strong>Explanation: </strong>": "Explanation: ",
  '<strong class="example">Example': "**Example",
  "<strong>": "**",
  "</strong>": "** ",
  "<pre>": "\n```\n",
  "</pre>": "```\n\n",
  "<code>": "<code>",
  "</code>": "</code>",
  "&lt;": "<",
  "&gt;": ">",
  "	": "", // special tab
  "<span.*?>": "",
  "</span>": "",
  '<font face="monospace">': "",
  "</font>": "",
};

const copyText = (isMarkdown, targetObj) => {
  // The title can be present while the description panel is not rendered
  // (e.g. the submissions tab is active); don't throw on a null clone.
  if (!targetObj.descriptionDom) return;

  // Get the current URL.
  const url = window.location.href;

  // Try to find the elements for the old version of the website.
  let title;
  let descriptionContent;
  let text;
  let html;

  // Get title
  title = targetObj.titleDom.innerText;

  // Get main problem description.
  descriptionContent = targetObj.descriptionDom.cloneNode(true);

  // Clean the content to be copied
  text = descriptionContent.textContent.replace(/(\n){2,}/g, "\n\n").trim();
  html = descriptionContent.innerHTML;

  // Removes unwanted elements.
  html = html
    .replace(/<div class=".*?" data-headlessui-state=".*?">/g, "")
    .replace(
      /<div id=".*?" aria-expanded=".*?" data-headlessui-state=".*?">/g,
      ""
    );

  let value;
  if (isMarkdown) {
    let htmlToMarkdown = html;
    // Replace HTML elements with markdown equivalents.
    Object.keys(MARKDOWN).forEach((key) => {
      htmlToMarkdown = htmlToMarkdown.replace(
        new RegExp(key, "g"),
        MARKDOWN[key]
      );
    });
    // Format the markdown string and add the title and URL.
    value = `# [${title}](${url})\n\n${htmlToMarkdown
      .replace(/(\n){2,}/g, "\n\n")
      .trim()}`;
  } else {
    // Format the plain text string and add the title and URL.
    value = `URL: ${url}\n\n${title}\n\n${text}`;
  }

  writeClipboard(value);
};

// Write a value to the clipboard via a hidden textarea. execCommand works
// synchronously inside click handlers, unlike navigator.clipboard which can
// fall outside the user-gesture window.
const writeClipboard = (value) => {
  const hiddenElement = document.createElement("textarea");
  hiddenElement.value = value;
  document.body.appendChild(hiddenElement);
  hiddenElement.select();
  document.execCommand("copy");
  document.body.removeChild(hiddenElement);
};

// Problem slug from the URL, works for /problems/x/ and /contest/y/problems/x/.
const getSlug = () => (location.pathname.match(/problems\/([^/]+)/) || [])[1];

// Target layouts. Re-queried on every call because LeetCode re-renders the
// DOM (e.g. after submitting code), which detaches previously found nodes.
const buildTargets = () => [
  {
    name: "originalLayout",
    titleDom: document.querySelector("[data-cy=question-title]"),
    descriptionDom: document.querySelector(
      "[data-track-load=description_content]"
    ),
    useStyle: true,
    style: `
      position: absolute;
      top: 1rem;
      right: 0;
      display: flex;
    `,
    classList: [],
  },
  {
    name: "newLayout",
    titleDom: document.querySelector(
      ".mr-2.text-lg.font-medium.text-label-1.dark\\:text-dark-label-1"
    ),
    descriptionDom: document.querySelector(
      "[data-track-load=description_content]"
    ),
    useStyle: false,
    style: "",
    classList: [
      "mt-1",
      "inline-flex",
      "min-h-20px",
      "items-center",
      "space-x-2",
      "align-top",
    ],
  },
  {
    name: "contestLayout",
    titleDom: document.querySelector(
      "#base_content > div.container > div > div > div.question-title.clearfix > h3"
    ),
    descriptionDom: document.querySelector(
      "div.question-content.default-content"
    ),
    useStyle: true,
    style: `display: flex;`,
    classList: [],
  },
  {
    name: "dynamicLayout",
    titleDom: document.querySelector(".text-title-large"),
    descriptionDom: document.querySelector(
      "[data-track-load=description_content]"
    ),
    useStyle: true,
    style: `display: flex;`,
    classList: [],
  },
];

// Set the base style for the buttons.
const BUTTON_STYLE = `
  padding: 4px 4px;
  color: ${MAIN_COLOR};
  background: ${ALT_COLOR};
  border-radius: 12px;
  border: 1px solid ${MAIN_COLOR};
  font-size: 10px;
  font-weight: normal;
  line-height: normal;
  letter-spacing: normal;
  text-decoration: none;
  text-transform: none;
  white-space: nowrap;
  box-sizing: border-box;
  cursor: pointer;
  text-align: center;
`;

const makeButton = (key, onClick) => {
  const _button = document.createElement("div");
  _button.innerText = BUTTON_MAP[key].text;
  _button.style = BUTTON_MAP[key].extra
    ? BUTTON_STYLE + BUTTON_MAP[key].extra
    : BUTTON_STYLE;

  // Buttons can live inside a link-like title element; keep the click from
  // triggering navigation or other page handlers.
  _button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  });

  _button.addEventListener("mouseenter", () => {
    _button.style.background = MAIN_COLOR;
    _button.style.color = TEXT_COLOR;
  });

  _button.addEventListener("mouseleave", () => {
    _button.style.background = ALT_COLOR;
    _button.style.color = MAIN_COLOR;
  });

  return _button;
};

let buttonContainer = null;
let zhChip = null;

const addButtons = () => {
  // Still attached: nothing to do.
  if (buttonContainer && buttonContainer.isConnected) return;

  const targetObject = buildTargets().find((t) => t.titleDom);
  if (!targetObject) return;
  const target = targetObject.titleDom;

  // Create a container for the buttons.
  buttonContainer = document.createElement("div");

  // Style button by layout
  if (targetObject.useStyle) {
    buttonContainer.style = targetObject.style;
  } else {
    targetObject.classList.forEach((i) => buttonContainer.classList.add(i));
  }

  // Set the parent element's position to relative to allow for absolute positioning of the button container.
  target.parentElement.style = "position: relative; align-items: center";

  // Loop through the buttons and add them to the button container.
  ["copy", "copyMarkdown"].forEach((key) => {
    const _button = makeButton(key, () => {
      copyText(key === "copyMarkdown", targetObject);
      _button.innerText = BUTTON_ACTION_TEXT;
      setTimeout(
        () => (_button.innerText = BUTTON_MAP[key].text),
        BUTTON_ACTION_WAIT_TIME
      );
    });
    buttonContainer.append(_button);
  });

  // Add the button container to the parent element.
  target.parentElement.appendChild(buttonContainer);

  // Solution button: only shown when the problem exists in the bundled
  // solutions.md library.
  const slug = getSlug();
  if (slug) {
    const container = buttonContainer;
    browser.runtime
      .sendMessage({ type: "solution", slug })
      .then((url) => {
        if (!url || !container.isConnected) return;
        container.append(
          makeButton("solution", () => window.open(url, "_blank"))
        );
      })
      .catch(() => {});
  }
};

// Add a "中文" chip at the end of the Topics/Companies/Hint chip row on
// leetcode.com, styled by cloning an existing chip so it always matches the
// current design. Clicking it opens the leetcode.cn page for the same problem.
const addZhChip = () => {
  if (!location.hostname.includes("leetcode.com")) return;
  if (zhChip && zhChip.isConnected) return;

  const slug = getSlug();
  if (!slug) return;

  // A whole chip = direct child of the div.flex.gap-1 row whose text is
  // exactly the label. (Matching any div/a picks up the chip's nested inner
  // divs, and inserting after those lands inside another chip.)
  let anchor = null;
  for (const label of ["Hint", "Companies", "Topics"]) {
    anchor = [...document.querySelectorAll("div.flex.gap-1 > *")].find(
      (el) => el.textContent.trim() === label
    );
    if (anchor) break;
  }
  if (!anchor) return;

  zhChip = anchor.cloneNode(true);
  zhChip.title = "Switch to the Chinese Problem Page";
  // Material Design "translate" icon, mirroring the A/文 icon leetcode.cn
  // uses for its language-switch button. currentColor inherits chip color.
  zhChip.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>';
  zhChip.style.cursor = "pointer";
  zhChip.addEventListener("click", () =>
    window.open(`https://leetcode.cn/problems/${slug}/description/`, "_blank")
  );
  anchor.parentElement.appendChild(zhChip);
};

// ---- Solution post pages ----
// URL shape on both sites: /problems/<q>/solutions/<id>/<article-slug>/
// Adds only Copy / Copy Markdown for the article; no Solution button here.

// [full match, numeric id, article slug]; the id segment is optional because
// old leetcode.cn solution URLs omit it.
const matchArticlePath = () =>
  location.pathname.match(/\/solutions\/(?:(\d+)\/)?([^/]+)/);

// Fetch the author's original markdown {title, content} via the same-origin
// GraphQL API (works logged-out). leetcode.cn looks articles up by slug;
// leetcode.com solutions live in the ugcArticle system, looked up by the
// numeric topic id from the URL (the old topic() API now returns only an
// "article-topic" placeholder).
const fetchArticle = (id, slug) => {
  const isCn = location.hostname.includes("leetcode.cn");
  if (!isCn && !id) return Promise.reject(new Error("no topic id in URL"));
  const body = isCn
    ? {
        operationName: "solutionDetailArticle",
        variables: { slug, orderBy: "DEFAULT" },
        query:
          "query solutionDetailArticle($slug: String!, $orderBy: SolutionArticleOrderBy!) { solutionArticle(slug: $slug, orderBy: $orderBy) { title content } }",
      }
    : {
        operationName: "ugcArticleSolutionArticle",
        variables: { topicId: parseInt(id, 10) },
        query:
          "query ugcArticleSolutionArticle($articleId: ID, $topicId: ID) { ugcArticleSolutionArticle(articleId: $articleId, topicId: $topicId) { title content } }",
      };
  return fetch("/graphql/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((r) => r.json())
    .then((r) => (isCn ? r.data.solutionArticle : r.data.ugcArticleSolutionArticle));
};

// The article title element carries no stable class or tag, so locate it by
// its text. The same text can also appear in a solutions-list row that is
// still in the DOM after SPA navigation, so among matching elements pick the
// visible one with the largest font size — the article header. ">=" keeps the
// deepest element when an ancestor wrapping only the title ties on size.
const findTitleElement = (title) => {
  // Whitespace-normalized compare: the page may render the title with
  // &nbsp; or collapsed spaces that differ from the GraphQL text.
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const text = norm(title);
  let best = null;
  let bestSize = 0;
  for (const el of document.querySelectorAll("h1, h2, h3, div, span")) {
    if (norm(el.textContent) !== text) continue;
    if (!el.offsetParent) continue; // hidden or detached
    const size = parseFloat(getComputedStyle(el).fontSize) || 0;
    if (size >= bestSize) {
      best = el;
      bestSize = size;
    }
  }
  return best;
};

let postContainer = null;
let postKey = null;
let postArticle = null;

const addPostCopyButtons = () => {
  const m = matchArticlePath();
  // Not on a solution article (or navigated to another one): drop the stale
  // container and start a fresh prefetch. Prefetching keeps the click handler
  // synchronous, so execCommand("copy") stays inside the user-gesture window.
  if (!m || m[0] !== postKey) {
    if (postContainer) {
      postContainer.remove();
      postContainer = null;
    }
    postKey = m ? m[0] : null;
    postArticle = m ? fetchArticle(m[1], m[2]).catch(() => null) : null;
    if (!m) return;
  }
  if (postContainer && postContainer.isConnected) return;

  const article = postArticle;
  article.then((data) => {
    if (!data || article !== postArticle) return;
    // Another tick's callback may have already built the buttons.
    if (postContainer && postContainer.isConnected) return;

    const anchor = findTitleElement(data.title);
    if (!anchor) return; // Not rendered yet; the next tick retries.

    // Right-align the buttons on the title's own row.
    anchor.style.position = "relative";
    postContainer = document.createElement("div");
    postContainer.style =
      "position: absolute; top: 50%; right: 0; transform: translateY(-50%); display: flex;";

    ["copy", "copyMarkdown"].forEach((key) => {
      const _button = makeButton(key, () => {
        writeClipboard(
          key === "copyMarkdown"
            ? `# [${data.title}](${location.href})\n\n${data.content}`
            : `URL: ${location.href}\n\n${data.title}\n\n${data.content}`
        );
        _button.innerText = BUTTON_ACTION_TEXT;
        setTimeout(
          () => (_button.innerText = BUTTON_MAP[key].text),
          BUTTON_ACTION_WAIT_TIME
        );
      });
      postContainer.append(_button);
    });

    anchor.appendChild(postContainer);
  });
};

// Poll instead of running once: LeetCode re-renders the header after code
// submission, which silently removes injected nodes.
setTimeout(() => {
  // Isolate each injector: a throw from one (e.g. mid-render DOM during SPA
  // navigation) must not stop the others.
  const tick = () => {
    [addButtons, addZhChip, addPostCopyButtons].forEach((f) => {
      try {
        f();
      } catch (e) {}
    });
  };
  tick();
  setInterval(tick, WAIT_TIME);
}, WAIT_TIME);
