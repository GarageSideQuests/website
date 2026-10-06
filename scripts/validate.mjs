import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
const origin = process.env.TEST_URL || "http://localhost:4321";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const context = await browser.newContext();
const pages = [
  "/",
  "/quests/",
  "/quests/meraki-mr53-openwrt/",
  "/quests/batterylab/",
  "/quests/local-voice-echomuse/",
  "/quest-log/",
  "/gear/",
  "/about/",
  "/privacy/",
  "/disclosure/",
  "/404.html",
];
await mkdir("test-results", { recursive: true });
try {
  for (const width of [375, 768, 1440, 2560]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 1000 });
    for (const path of pages) {
      const response = await page.goto(origin + path);
      assert.equal(response.status(), 200, path);
      assert.equal(await page.locator("h1").count(), 1, path);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `overflow ${width} ${path}`,
      );
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        [],
        `accessibility ${width} ${path}`,
      );
      if (path === "/")
        await page.screenshot({
          path: `test-results/home-${width}.png`,
          fullPage: true,
        });
    }
    await page.close();
  }
  const page = await context.newPage();
  await page.goto(origin);
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").textContent(), "Skip to content");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(":focus").getAttribute("id"), "main");
  await page.keyboard.press("Tab");
  assert.ok(await page.locator(":focus").getAttribute("href"));
  for (const path of pages) {
    await page.goto(origin + path);
    const links = await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
    for (const href of new Set(links.filter((h) => h.startsWith("/")))) {
      const url = new URL(href, origin);
      const r = await page.request.get(url.href);
      assert.equal(r.status(), 200, href);
      if (url.hash && r.headers()["content-type"]?.includes("text/html"))
        assert.ok((await r.text()).includes(`id="${url.hash.slice(1)}"`), href);
    }
    assert.equal(await page.locator("script[src]").count(), 0, "no client JS");
  }
  for (const path of [
    "/rss.xml",
    "/sitemap-index.xml",
    "/sitemap-0.xml",
    "/robots.txt",
  ])
    assert.equal((await page.request.get(origin + path)).status(), 200, path);
  const rss = await readFile("dist/rss.xml", "utf8");
  assert.ok(rss.includes("<rss"));
  assert.ok(!rss.includes("<item>"));
  const sitemap = await readFile("dist/sitemap-0.xml", "utf8");
  assert.ok(
    sitemap.includes("https://garagesidequests.com/quests/batterylab/"),
  );
  assert.ok(!sitemap.includes("404"));
  console.log(
    "PASS: 44 responsive/accessibility page checks; keyboard skip/focus; internal links and fragments; zero client scripts; RSS, sitemap, robots.",
  );
} finally {
  await browser.close();
}
