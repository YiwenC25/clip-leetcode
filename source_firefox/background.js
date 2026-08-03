// Background script: handles cross-origin fetches the content script can't do
// (leetcode.cn GraphQL) and parses the bundled solutions.md into a slug -> URL map.

let solutionMap = null;

const getSolutionMap = async () => {
  if (solutionMap) return solutionMap;
  const text = await (await fetch(browser.runtime.getURL("solutions.md"))).text();
  solutionMap = {};
  // Row: | [123. title](https://leetcode.cn/problems/<slug>/) | [text](solutionURL) |
  // Greedy .* before the last ](url) tolerates nested brackets in link text.
  const re =
    /^\|\s*\[.*?\]\(https:\/\/leetcode\.cn\/problems\/([^/)]+)\/?\)\s*\|.*\]\((https?:[^)]+)\)\s*\|\s*$/gm;
  for (const m of text.matchAll(re)) solutionMap[m[1]] = m[2];
  return solutionMap;
};

const fetchTranslation = (slug) =>
  fetch("https://leetcode.cn/graphql/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query:
        "query ($titleSlug: String!) { question(titleSlug: $titleSlug) { translatedContent } }",
      variables: { titleSlug: slug },
    }),
  })
    .then((r) => r.json())
    .then((d) => (d.data && d.data.question && d.data.question.translatedContent) || null)
    .catch(() => null);

browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "solution") {
    return getSolutionMap().then((m) => m[msg.slug] || null);
  }
  if (msg.type === "translate") {
    return fetchTranslation(msg.slug);
  }
});
