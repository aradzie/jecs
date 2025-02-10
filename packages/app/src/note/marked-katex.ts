import { KatexOptions, renderToString } from "katex";
import { MarkedExtension, TokenizerAndRendererExtension } from "marked";
import { findBlock, findInline, parseBlock, parseInline, Result } from "./math.ts";

export function markedKatex(options: KatexOptions): MarkedExtension {
  return {
    extensions: [
      blockKatex(options), //
      inlineKatex(options),
    ],
  };
}

function blockKatex(options: KatexOptions): TokenizerAndRendererExtension {
  const result: Result = { raw: "", text: "" };
  return {
    name: "blockKatex",
    level: "block",
    start(src) {
      return findBlock(src);
    },
    tokenizer(src) {
      if (parseBlock(src, result)) {
        return {
          type: "blockKatex",
          raw: result.raw,
          text: result.text,
        };
      }
      return;
    },
    renderer({ text }) {
      return renderToString(text, { ...options, displayMode: true }) + "\n";
    },
  };
}

function inlineKatex(options: KatexOptions): TokenizerAndRendererExtension {
  const result: Result = { raw: "", text: "" };
  return {
    name: "inlineKatex",
    level: "inline",
    start(src) {
      return findInline(src);
    },
    tokenizer(src) {
      if (parseInline(src, result)) {
        return {
          type: "inlineKatex",
          raw: result.raw,
          text: result.text,
        };
      }
      return;
    },
    renderer({ text }) {
      return renderToString(text, { ...options, displayMode: false });
    },
  };
}
