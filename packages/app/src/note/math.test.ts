import { deepEqual, equal } from "node:assert/strict";
import { describe, it } from "node:test";
import { findInline, parseBlock, parseInline, type Result } from "./math.ts";

describe("find inline", () => {
  it("should ignore partial math", () => {
    equal(findInline(""), undefined);
    equal(findInline("abc"), undefined);
    equal(findInline("$"), undefined);
    equal(findInline("$$"), undefined);
    equal(findInline("\\("), undefined);
    equal(findInline("\\(\\)"), undefined);
    equal(findInline("$$\\(\\)"), undefined);
  });

  it("should find inline math", () => {
    equal(findInline(" $a$ "), 1);
    equal(findInline(" \\(a\\) "), 1);
  });
});

describe("parse inline", () => {
  const result: Result = { raw: "", text: "" };

  it("should ignore arbitrary text", () => {
    equal(parseInline("", result), false);
    equal(parseInline("abc", result), false);
  });

  it("should ignore partial math", () => {
    equal(parseInline("$", result), false);
    equal(parseInline("$abc", result), false);
    equal(parseInline("abc$", result), false);
    equal(parseInline("\\(", result), false);
    equal(parseInline("\\)", result), false);
    equal(parseInline("\\)\\(", result), false);
    equal(parseInline("\\(abc", result), false);
    equal(parseInline("abc\\)", result), false);
    equal(parseInline("\\)abc\\(", result), false);
  });

  it("should parse legal math", () => {
    equal(parseInline("$a$", result), true);
    deepEqual(result, { raw: "$a$", text: "a" });

    equal(parseInline("$a$xyz", result), true);
    deepEqual(result, { raw: "$a$", text: "a" });

    equal(parseInline("\\(a\\)", result), true);
    deepEqual(result, { raw: "\\(a\\)", text: "a" });

    equal(parseInline("\\(a\\)xyz", result), true);
    deepEqual(result, { raw: "\\(a\\)", text: "a" });
  });
});

describe("parse block", () => {
  const result: Result = { raw: "", text: "" };

  it("should ignore arbitrary text", () => {
    equal(parseBlock("", result), false);
    equal(parseBlock("abc", result), false);
  });

  it("should ignore partial", () => {
    equal(parseBlock("$$\n", result), false);
    equal(parseBlock("\n$$", result), false);
    equal(parseBlock("\n$$abc", result), false);
    equal(parseBlock("abc$$\n", result), false);
    equal(parseBlock("\\[\n", result), false);
    equal(parseBlock("\n\\]", result), false);
    equal(parseBlock("\n\\]\\[\n", result), false);
    equal(parseBlock("\\[\nabc", result), false);
    equal(parseBlock("abc\n\\]", result), false);
    equal(parseBlock("\n\\]abc\\[\n", result), false);
  });

  it("should parse legal math", () => {
    equal(parseBlock("$$a$$", result), true);
    deepEqual(result, { raw: "$$a$$", text: "a" });

    equal(parseBlock("$$\na\n$$", result), true);
    deepEqual(result, { raw: "$$\na\n$$", text: "a" });

    equal(parseBlock("$$\na\n$$xyz", result), true);
    deepEqual(result, { raw: "$$\na\n$$", text: "a" });

    equal(parseBlock("\\[a\\]", result), true);
    deepEqual(result, { raw: "\\[a\\]", text: "a" });

    equal(parseBlock("\\[\na\n\\]", result), true);
    deepEqual(result, { raw: "\\[\na\n\\]", text: "a" });

    equal(parseBlock("\\[\na\n\\]xyz", result), true);
    deepEqual(result, { raw: "\\[\na\n\\]", text: "a" });
  });
});
