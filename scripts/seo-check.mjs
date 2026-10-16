#!/usr/bin/env node
// Crawl-level SEO smoke test against a running server.
// Usage: node scripts/seo-check.mjs [baseUrl] [canonicalOrigin]
//   baseUrl          where to send requests (default http://localhost:3000)
//   canonicalOrigin  origin expected in canonical/hreflang (default: NEXT_PUBLIC_SITE_URL or baseUrl)

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
const origin = (process.argv[3] ?? process.env.NEXT_PUBLIC_SITE_URL ?? base).replace(/\/+$/, "");

const PAGES = ["/", "/assessment", "/assessment/personality", "/assessment/level", "/privacy", "/terms"];
const LOCALES = { ar: { prefix: "", dir: "rtl" }, en: { prefix: "/en", dir: "ltr" } };

const errors = [];
const fail = (url, message) => errors.push(`${url}: ${message}`);
const abs = (path) => (path === "/" ? origin : `${origin}${path}`);
const localePath = (locale, path) => {
  const prefix = LOCALES[locale].prefix;
  return path === "/" ? prefix || "/" : `${prefix}${path}`;
};

async function get(path, { redirect = "manual" } = {}) {
  const response = await fetch(`${base}${path}`, { redirect });
  return { response, body: await response.text() };
}

const decode = (text) =>
  text.replace(/&#x27;/g, "'").replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`, "i"))?.[1];

// robots.txt and sitemap.xml
{
  const { response, body } = await get("/robots.txt");
  if (response.status !== 200) fail("/robots.txt", `status ${response.status}`);
  else if (!response.headers.get("content-type")?.includes("text/plain")) fail("/robots.txt", "not text/plain");
  else if (!body.includes(`Sitemap: ${origin}/sitemap.xml`)) fail("/robots.txt", "missing Sitemap line");
}
{
  const { response, body } = await get("/sitemap.xml");
  if (response.status !== 200) fail("/sitemap.xml", `status ${response.status}`);
  else {
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const expected = PAGES.flatMap((p) => Object.keys(LOCALES).map((l) => abs(localePath(l, p))));
    for (const url of expected) if (!locs.includes(url)) fail("/sitemap.xml", `missing ${url}`);
    if (!body.includes('hreflang="x-default"')) fail("/sitemap.xml", "no x-default alternates");
  }
}

// Public pages
const titles = new Map();
for (const page of PAGES) {
  for (const [locale, { dir }] of Object.entries(LOCALES)) {
    const path = localePath(locale, page);
    const { response, body } = await get(path);
    if (response.status !== 200) {
      fail(path, `status ${response.status}`);
      continue;
    }

    const html = body.match(/<html[^>]*>/i)?.[0] ?? "";
    if (attr(html, "lang") !== locale) fail(path, `<html lang> is "${attr(html, "lang")}"`);
    if (attr(html, "dir") !== dir) fail(path, `<html dir> is "${attr(html, "dir")}"`);

    const title = body.match(/<title>([^<]*)<\/title>/)?.[1];
    if (!title) fail(path, "missing <title>");
    else if (titles.has(title)) fail(path, `duplicate title with ${titles.get(title)}`);
    else titles.set(title, path);

    if (!/<meta name="description" content="[^"]+"/.test(body)) fail(path, "missing meta description");
    if (/<meta name="robots" content="[^"]*noindex/.test(body)) fail(path, "is noindex");

    const canonical = attr(body.match(/<link rel="canonical"[^>]*>/)?.[0] ?? "", "href");
    if (canonical !== abs(path)) fail(path, `canonical is ${canonical}, expected ${abs(path)}`);

    const ogUrl = attr(body.match(/<meta property="og:url"[^>]*>/)?.[0] ?? "", "content");
    if (ogUrl !== abs(path)) fail(path, `og:url is ${ogUrl}`);

    const alternates = Object.fromEntries(
      [...body.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]])
    );
    const expected = { ar: abs(localePath("ar", page)), en: abs(localePath("en", page)), "x-default": abs(localePath("ar", page)) };
    for (const [lang, href] of Object.entries(expected)) {
      if (alternates[lang] !== href) fail(path, `hreflang ${lang} is ${alternates[lang]}, expected ${href}`);
    }

    if (response.headers.get("link")?.includes("hreflang")) fail(path, "hreflang also sent in Link header");

    if (title && [...decode(title)].length > 60) fail(path, `title is ${[...decode(title)].length} chars (> 60)`);
    const description = decode(body.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
    if ([...description].length > 160) fail(path, `description is ${[...description].length} chars (> 160)`);

    const ogImage = attr(body.match(/<meta property="og:image"[^>]*>/)?.[0] ?? "", "content");
    if (!ogImage?.endsWith(`/og/imath-${locale}.jpg`)) fail(path, `og:image is ${ogImage}`);
    if (!body.includes('<meta name="twitter:card" content="summary_large_image"/>')) fail(path, "twitter:card is not summary_large_image");

    // Structured data: every block parses, and a WebPage node describes this exact URL.
    const blocks = [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    const nodes = [];
    for (const block of blocks) {
      try {
        const data = JSON.parse(block);
        nodes.push(...(data["@graph"] ?? [data]));
      } catch {
        fail(path, "invalid JSON-LD");
      }
    }
    const types = nodes.map((node) => node["@type"]);
    const webPage = nodes.find((node) => node["@type"] === "WebPage");
    if (webPage?.url !== abs(path)) fail(path, `WebPage JSON-LD url is ${webPage?.url}`);
    if (page === "/") {
      for (const type of ["EducationalOrganization", "WebSite", "Course", "FAQPage"]) {
        if (!types.includes(type)) fail(path, `missing ${type} JSON-LD`);
      }
      // Every FAQPage answer must also be in the visible HTML, not only in the JSON-LD.
      const visible = body.replace(/<script[\s\S]*?<\/script>/g, "");
      const faq = nodes.find((node) => node["@type"] === "FAQPage");
      for (const question of faq?.mainEntity ?? []) {
        const answer = question.acceptedAnswer.text.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");
        if (!visible.includes(answer)) fail(path, `FAQ answer not in HTML: "${question.name}"`);
      }
    } else if (!types.includes("BreadcrumbList")) {
      fail(path, "missing BreadcrumbList JSON-LD");
    }
  }
}

// Admin must not be indexable
{
  const { response, body } = await get("/en/admin/login");
  if (response.status === 200 && !/<meta name="robots" content="noindex, nofollow"/.test(body)) {
    fail("/en/admin/login", "missing noindex");
  }
}

// Unknown URLs must 404
{
  const { response } = await get("/this-page-does-not-exist");
  if (response.status !== 404) fail("/this-page-does-not-exist", `status ${response.status}`);
}

if (errors.length) {
  console.error(`SEO check failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`SEO check passed: ${PAGES.length * 2} pages, robots.txt, sitemap.xml, admin, 404 (origin ${origin}).`);
