import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { personalize } from "../src/lib/assessment/common";

describe("personalize", () => {
  it("picks the gendered form and fills the name", () => {
    const text = "{name} {دقيق|دقيقة} و{منظّم|منظّمة}";
    assert.equal(personalize(text, "boy", "علي"), "علي دقيق ومنظّم");
    assert.equal(personalize(text, "girl", "سارة"), "سارة دقيقة ومنظّمة");
  });

  it("trims the name and leaves plain text alone", () => {
    assert.equal(personalize("Hello {name}", "boy", "  Sam "), "Hello Sam");
    assert.equal(personalize("No placeholders", "girl", "Sam"), "No placeholders");
  });

  it("supports an empty form on either side of a pair", () => {
    assert.equal(personalize("جميل{|ة}", "boy", "x"), "جميل");
    assert.equal(personalize("جميل{|ة}", "girl", "x"), "جميلة");
  });
});
