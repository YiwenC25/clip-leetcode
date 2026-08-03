const MAIN_COLOR = "#0CB345";
const ALT_COLOR = "transparent";
const TEXT_COLOR = "#ffffff";
const BUTTON_ACTION_TEXT = "Copied!";
const BUTTON_ACTION_WAIT_TIME = 1000;
const WAIT_TIME = 1000;

// Class marking injected Chinese translation blocks.
const ZH_CLASS = "clip-zh-block";

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

  // Get main problem description, without any injected translation blocks.
  descriptionContent = targetObj.descriptionDom.cloneNode(true);
  descriptionContent
    .querySelectorAll("." + ZH_CLASS)
    .forEach((el) => el.remove());

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

// Insert each Chinese block below its matching English block. Blocks are
// paired by tag name with two pointers, since leetcode.cn translations mirror
// the English block structure (p/pre/ul...).
// ponytail: tag-order pairing, no semantic matching; misaligns only if the
// translation restructures blocks — leftovers land at the end.
const insertTranslation = (html) => {
  const desc = document.querySelector("[data-track-load=description_content]");
  if (!desc) return;

  const zhBody = new DOMParser().parseFromString(html, "text/html").body;
  zhBody.querySelectorAll("script").forEach((s) => s.remove());
  const zhBlocks = [...zhBody.children].filter((b) => b.textContent.trim());

  let enBlocks = [...desc.children];
  // Some layouts wrap the whole description in a single div.
  if (enBlocks.length === 1 && enBlocks[0].children.length > 1) {
    enBlocks = [...enBlocks[0].children];
  }
  const parent = enBlocks[0] ? enBlocks[0].parentElement : desc;

  let j = 0;
  for (const zb of zhBlocks) {
    zb.classList.add(ZH_CLASS);
    zb.style.cssText += `border-left: 2px solid ${MAIN_COLOR}; padding-left: 8px; margin: 4px 0;`;
    let k = j;
    while (k < enBlocks.length && enBlocks[k].tagName !== zb.tagName) k++;
    if (k < enBlocks.length) {
      enBlocks[k].after(zb);
      j = k + 1;
    } else {
      parent.appendChild(zb);
    }
  }
};

const toggleTranslation = async (chip) => {
  // Second click removes the translation.
  const existing = document.querySelectorAll("." + ZH_CLASS);
  if (existing.length) {
    existing.forEach((el) => el.remove());
    return;
  }

  const slug = getSlug();
  if (!slug) return;

  const original = chip.textContent;
  chip.textContent = "…";
  let html = null;
  try {
    html = await browser.runtime.sendMessage({ type: "translate", slug });
  } catch (e) {}
  chip.textContent = original;

  if (!html) {
    chip.textContent = "无翻译";
    setTimeout(() => (chip.textContent = original), BUTTON_ACTION_WAIT_TIME);
    return;
  }
  insertTranslation(html);
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

// Add a "中文" chip after the Hint chip on leetcode.com, styled by cloning an
// existing chip so it always matches the current design.
const addZhChip = () => {
  if (!location.hostname.includes("leetcode.com")) return;
  if (zhChip && zhChip.isConnected) return;

  // Innermost element whose text is exactly the chip label.
  let anchor = null;
  for (const label of ["Hint", "Companies", "Topics"]) {
    const matches = [...document.querySelectorAll("div, a")].filter(
      (el) => el.textContent.trim() === label
    );
    if (matches.length) {
      anchor = matches[matches.length - 1];
      break;
    }
  }
  if (!anchor) return;

  zhChip = anchor.cloneNode(true);
  zhChip.textContent = "中文";
  zhChip.addEventListener("click", () => toggleTranslation(zhChip));
  anchor.after(zhChip);
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
