import { test } from "node:test";
import { doesNotThrow, equal, like, throws } from "rich-assert";
import { parse } from "./parser.js";

test("parse empty netlist", () => {
  like(parse("\n"), { items: [] });
  like(parse(" # comment \n"), { items: [] });
});

test("parse netlist", () => {
  const input = "\n\n# a\n#b\n\nR:R1 \t\n a \t\n b # inline\n\n# c\n# d\n\n";
  const document = parse(input);
  equal(document.items.length, 1);
});

test("check whitespace", () => {
  doesNotThrow(() => {
    parse("R:R1 a b R=100\n");
  });
  doesNotThrow(() => {
    parse("R:R1 \n a \n b \n R=100\n");
  });
  throws(() => {
    parse(" R:R1 a b R=100\n");
  });
  doesNotThrow(() => {
    parse(".dc\n");
  });
  throws(() => {
    parse(" .dc\n");
  });
});
