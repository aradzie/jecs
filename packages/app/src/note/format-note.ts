import { Marked } from "marked";
import { markedKatex } from "./marked-katex.ts";

const marked = new Marked(
  markedKatex({
    output: "mathml",
    throwOnError: false,
  }),
);

export function formatNote(text: string): string {
  return marked.parse(text, {
    async: false,
    silent: true,
    gfm: false,
    pedantic: false,
  });
}
