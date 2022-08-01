import test from "ava";
import { parse } from "./parser.js";

test("parse empty netlist", (t) => {
  t.like(parse("\n"), { items: [] });
  t.like(parse(" # comment \n"), { items: [] });
});

test("parse netlist", (t) => {
  const input = "\n\n# a\n#b\n\nR:R1 \t\n a \t\n b # inline\n\n# c\n# d\n\n";
  const document = parse(input);
  t.is(document.items.length, 1);
});

test("check whitespace", (t) => {
  t.notThrows(() => {
    parse("R:R1 a b R=100\n");
  });
  t.notThrows(() => {
    parse("R:R1 \n a \n b \n R=100\n");
  });
  t.throws(() => {
    parse(" R:R1 a b R=100\n");
  });
  t.notThrows(() => {
    parse(".dc\n");
  });
  t.throws(() => {
    parse(" .dc\n");
  });
});
