import test from "ava";
import type { Equation } from "./ast";
import { parse } from "./parser";
import { Variables } from "./variables";

const input = `
R:R1 [N1 N2] R=$c;
R:R2 [N1 N2] R=sin($PI);
.eq $a = -(-(1));
.eq $b = $a + 2;
.eq $c = -+sin($a + $b);
`;

test("variables", (t) => {
  const netlist = parse(input);

  const variables = new Variables(
    netlist.items.filter((item) => item.type === "equation") as Equation[],
  );

  t.is(variables.lookup("$a"), 1);
  t.is(variables.lookup("$b"), 3);
  t.is(variables.lookup("$c"), 0.7568024953079282);
  t.is(variables.lookup("$PI"), Math.PI);
  t.is(variables.lookup("$E"), Math.E);
  t.is(variables.evalExp({ type: "literal", value: 3.14 }), 3.14);
});
