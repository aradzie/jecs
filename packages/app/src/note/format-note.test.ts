import { equal } from "node:assert/strict";
import { test } from "node:test";
import { formatNote } from "./format-note.ts";

test("format trivial note", () => {
  equal(formatNote(""), "");
  equal(formatNote("note"), "<p>note</p>\n");
  equal(formatNote("note\n"), "<p>note</p>\n");
  equal(formatNote("# note"), "<h1>note</h1>\n");
  equal(formatNote("# note\n"), "<h1>note</h1>\n");
});

test("format html note", () => {
  equal(formatNote("<em>note</em>"), "<p><em>note</em></p>\n");
  equal(formatNote("<html>note</html>"), "<html>note</html>");
});

test("format inline math", () => {
  equal(
    formatNote("$A$"),
    `<p>` +
      `<span class="katex">` +
      `<math xmlns="http://www.w3.org/1998/Math/MathML">` +
      `<semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics>` +
      `</math>` +
      `</span>` +
      `</p>\n`,
  );
  equal(
    formatNote("\\(A\\)"),
    `<p>` +
      `<span class="katex">` +
      `<math xmlns="http://www.w3.org/1998/Math/MathML">` +
      `<semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics>` +
      `</math>` +
      `</span>` +
      `</p>\n`,
  );
  equal(
    formatNote("one $A$ two"),
    `<p>one ` +
      `<span class="katex">` +
      `<math xmlns="http://www.w3.org/1998/Math/MathML">` +
      `<semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics>` +
      `</math>` +
      `</span>` +
      ` two</p>\n`,
  );
  equal(
    formatNote("one \\(A\\) two"),
    `<p>one ` +
      `<span class="katex">` +
      `<math xmlns="http://www.w3.org/1998/Math/MathML">` +
      `<semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics>` +
      `</math>` +
      `</span>` +
      ` two</p>\n`,
  );
});

test("format block math", () => {
  equal(
    formatNote("$$\nA\n$$"),
    `<span class="katex">` +
      `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">` +
      `<semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics>` +
      `</math>` +
      `</span>\n`,
  );
  equal(
    formatNote("\\[\nA\n\\]"),
    `<span class="katex">` +
      `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">` +
      `<semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics>` +
      `</math>` +
      `</span>\n`,
  );
  equal(
    formatNote("one\n\n\\[\nA\n\\]\n\ntwo"),
    `<p>one</p>\n` +
      `<span class="katex">` +
      `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">` +
      `<semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics>` +
      `</math>` +
      `</span>\n` +
      `<p>two</p>\n`,
  );
  equal(
    formatNote("one\n\n$$\nA\n$$\n\ntwo"),
    `<p>one</p>\n` +
      `<span class="katex">` +
      `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">` +
      `<semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics>` +
      `</math>` +
      `</span>\n` +
      `<p>two</p>\n`,
  );
});
