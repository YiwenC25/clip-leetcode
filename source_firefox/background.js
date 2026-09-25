// Background script: parses the bundled solutions.md into a slug -> URL map.

let solutionMap = null;

const getSolutionMap = async () => {
  if (solutionMap) return solutionMap;
  const text = await (await fetch(browser.runtime.getURL("solutions.md"))).text();
  solutionMap = {};
  // Row: | 742 | [123. title](https://leetcode.cn/problems/<slug>/) | [text](solutionURL) |
  // The leading index column is optional (older files omit it).
  // Greedy .* before the last ](url) tolerates nested brackets in link text.
  const re =
    /^\|(?:\s*\d+\s*\|)?\s*\[.*?\]\(https:\/\/leetcode\.cn\/problems\/([^/)]+)\/?\)\s*\|.*\]\((https?:[^)]+)\)\s*\|\s*$/gm;
  for (const m of text.matchAll(re)) solutionMap[m[1]] = m[2];
  return solutionMap;
};

browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "solution") {
    return getSolutionMap().then((m) => m[msg.slug] || null);
  }
});
