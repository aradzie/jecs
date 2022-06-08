import test from "ava";
import { parse } from "./parser.js";

test("parse empty netlist", (t) => {
  t.like(parse("\n"), { items: [] });
  t.like(parse(" # comment \n"), { items: [] });
});

test("parse netlist", (t) => {
  t.like(parse("\n\n# a\n#b\n\nR \t\n a \t\n b # inline\n\n# c\n# d\n\n"), {
    items: [
      {
        type: "instance",
        deviceId: {
          name: "R",
        },
        instanceId: null,
        nodes: [{ name: "a" }, { name: "b" }],
        modelId: null,
        properties: [],
      },
    ],
  });
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
