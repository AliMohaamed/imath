import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPageMetadata, INDEXABLE_PAGES } from "../src/lib/seo";
import { getLocaleAlternates, getLocalePath, normalizeBaseUrl } from "../src/lib/site";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";

describe("getLocalePath", () => {
  it("leaves the default locale unprefixed and prefixes the others", () => {
    assert.equal(getLocalePath("ar", "/"), "/");
    assert.equal(getLocalePath("en", "/"), "/en");
    assert.equal(getLocalePath("ar", "/privacy"), "/privacy");
    assert.equal(getLocalePath("en", "/privacy"), "/en/privacy");
  });
});

describe("normalizeBaseUrl", () => {
  it("adds https and strips trailing slashes", () => {
    assert.equal(normalizeBaseUrl("www.imathmental.com/"), "https://www.imathmental.com");
    assert.equal(normalizeBaseUrl("https://www.imathmental.com"), "https://www.imathmental.com");
  });
});

describe("getLocaleAlternates", () => {
  it("includes every locale plus x-default pointing at the default locale", () => {
    assert.deepEqual(getLocaleAlternates("/terms"), {
      ar: "/terms",
      en: "/en/terms",
      "x-default": "/terms",
    });
  });
});

describe("buildPageMetadata", () => {
  for (const page of INDEXABLE_PAGES) {
    for (const locale of ["ar", "en"] as const) {
      it(`self-canonicalises ${locale} ${page.path}`, () => {
        const metadata = buildPageMetadata({ locale, path: page.path, title: "T", description: "D" });
        const expected = getLocalePath(locale, page.path);
        assert.equal(metadata.alternates?.canonical, expected);
        assert.equal(metadata.openGraph?.url, expected);
        const languages = metadata.alternates?.languages as Record<string, string>;
        assert.equal(languages[locale], expected, "canonical must be part of the hreflang set");
        assert.ok(languages["x-default"]);
      });
    }
  }

  it("uses an absolute title only when asked", () => {
    assert.deepEqual(
      buildPageMetadata({ locale: "ar", path: "/", title: "Home", description: "D", absoluteTitle: true }).title,
      { absolute: "Home" }
    );
    assert.equal(buildPageMetadata({ locale: "en", path: "/terms", title: "Terms", description: "D" }).title, "Terms");
  });
});

describe("sitemap", () => {
  const entries = sitemap();

  it("lists every indexable page in every locale with absolute URLs", () => {
    assert.equal(entries.length, INDEXABLE_PAGES.length * 2);
    for (const entry of entries) {
      assert.match(entry.url, /^https?:\/\//);
      assert.ok(entry.lastModified);
    }
  });

  it("has reciprocal hreflang: each URL appears in its own alternates and in its siblings'", () => {
    const urls = new Set(entries.map((entry) => entry.url));
    for (const entry of entries) {
      const languages = entry.alternates?.languages as Record<string, string>;
      assert.ok(Object.values(languages).includes(entry.url), `${entry.url} missing from its own alternates`);
      for (const [lang, href] of Object.entries(languages)) {
        assert.match(href, /^https?:\/\//);
        if (lang !== "x-default") assert.ok(urls.has(href), `${href} is not itself in the sitemap`);
      }
    }
  });
});

describe("robots", () => {
  it("references the sitemap and keeps admin and API out", () => {
    const result = robots();
    assert.match(String(result.sitemap), /\/sitemap\.xml$/);
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    for (const path of ["/admin", "/en/admin", "/api/"]) {
      assert.ok([rules.disallow].flat().includes(path), `${path} should be disallowed`);
    }
  });
});
