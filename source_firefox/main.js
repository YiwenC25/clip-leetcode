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

  // Create a hidden textarea element.
  const hiddenElement = document.createElement("textarea");

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

  // Set the value of the hidden textarea element.
  hiddenElement.value = value;
  // Add the element to the document.
  document.body.appendChild(hiddenElement);
  // Select the text in the element.
  hiddenElement.select();
  // Copy the text.
  document.execCommand("copy");
  // Remove the hidden element from the document.
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
  cursor: pointer;
  text-align: center;
`;

const makeButton = (key, onClick) => {
  const _button = document.createElement("div");
  _button.innerText = BUTTON_MAP[key].text;
  _button.style = BUTTON_MAP[key].extra
    ? BUTTON_STYLE + BUTTON_MAP[key].extra
    : BUTTON_STYLE;

  _button.addEventListener("click", onClick);

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

// Poll instead of running once: LeetCode re-renders the header after code
// submission, which silently removes injected nodes.
setTimeout(() => {
  const tick = () => {
    addButtons();
    addZhChip();
  };
  tick();
  setInterval(tick, WAIT_TIME);
}, WAIT_TIME);
