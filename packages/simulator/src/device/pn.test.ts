import test from "ava";
import { default_I_S, default_n, default_T, PN } from "./pn";

test("pn", (t) => {
  const pn = new PN(default_I_S, default_T, default_n);
  t.is(pn.I_D(0), 0);
  t.is(pn.I_D(0.1), 4.67624414726635e-13);
  t.is(pn.I_D(0.5), 2.485607729920057e-6);
  t.is(pn.I_D(0.7), 5.670294683520748e-3);
  t.is(pn.I_D(0.8), 2.7082711795488373e-1);
  t.is(pn.I_D(0.9), 1.2935364370530712e1);
  t.is(pn.I_D(1.0), 6.178245836750492e2);
});
