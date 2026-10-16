import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ArticleCopy } from "../src/content/types";
import { PROGRAM_COPY } from "../src/content/program";
import { getResource, RESOURCES, stripLinks } from "../src/content/resources";
import { INDEXABLE_PAGES } from "../src/lib/seo";

const pages: Array<[string, Record<"ar" | "en", ArticleCopy>]> = [
  ["program", PROGRAM_COPY],
  ...RESOURCES.map((resource): [string, Record<"ar" | "en", ArticleCopy>] => [resource.slug, resource.copy]),
];
const indexablePaths = new Set(INDEXABLE_PAGES.map((page) => page.path));

function allText(copy: ArticleCopy) {
  return [
    copy.summary,
    ...copy.sections.flatMap((section) =>
      section.blocks.flatMap((block) => (block.type === "p" ? [block.text] : block.items))
    ),
    ...copy.faq.map((item) => item.answer),
  ];
}

describe("long-form content", () => {
  for (const [name, copy] of pages) {
    for (const locale of ["ar", "en"] as const) {
      it(`${name} (${locale}) fits search result limits`, () => {
        // The layout appends " | iMath" (8 characters) to the title.
        assert.ok([...copy[locale].title].length + 8 <= 60, `title too long: ${copy[locale].title}`);
        assert.ok([...copy[locale].description].length <= 155, `description too long (${copy[locale].description.length})`);
      });

      it(`${name} (${locale}) only links to pages that exist`, () => {
        for (const text of allText(copy[locale])) {
          for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
            if (href.startsWith("/")) assert.ok(indexablePaths.has(href), `broken internal link ${href}`);
          }
        }
      });
    }

    it(`${name} has the same structure in Arabic and English`, () => {
      assert.equal(copy.ar.sections.length, copy.en.sections.length);
      assert.equal(copy.ar.faq.length, copy.en.faq.length);
      copy.ar.sections.forEach((section, index) => {
        assert.equal(section.blocks.length, copy.en.sections[index].blocks.length, `section ${index} differs`);
      });
    });
  }

  it("related guides exist and don't point to themselves", () => {
    for (const resource of RESOURCES) {
      for (const slug of resource.related) {
        assert.ok(getResource(slug), `${resource.slug} → missing ${slug}`);
        assert.notEqual(slug, resource.slug);
      }
    }
  });

  it("stripLinks keeps the label and drops the URL", () => {
    assert.equal(stripLinks("Try the [free test](/assessment/level) now"), "Try the free test now");
  });
});
