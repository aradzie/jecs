import test from "ava";
import { Properties } from "./properties.js";

test("validate properties", (t) => {
  t.throws(
    () => {
      new Properties({}).set("x", 0);
    },
    { message: `Unknown property [x]` },
  );
  t.throws(
    () => {
      new Properties({
        V: Properties.number({ title: "value" }),
      }).set("V", "omg");
    },
    {
      message:
        `Invalid value for property [V], ` + //
        `expected a number, got "omg"`,
    },
  );
  t.throws(
    () => {
      new Properties({
        V: Properties.enum({ values: ["one", "two"], title: "value" }),
      }).set("V", 1);
    },
    {
      message:
        `Invalid value for property [V], ` + //
        `expected a string, got 1`,
    },
  );
  t.throws(
    () => {
      new Properties({
        V: Properties.enum({ values: ["one", "two"], title: "value" }),
      }).set("V", "zero");
    },
    {
      message:
        `Invalid value for property [V], ` + //
        `expected one of {"one", "two"}, got "zero"`,
    },
  );
});

test("get properties", (t) => {
  const p = new Properties({
    a: Properties.number({ defaultValue: 1, title: "a" }),
    b: Properties.number({ title: "b" }),
  });

  t.false(p.hasAll());
  t.is(p.getNumber("a", 123), 123);
  t.is(p.getNumber("b", 123), 123);

  p.set("b", 222);

  t.true(p.hasAll());
  t.is(p.getNumber("a", 123), 123);
  t.is(p.getNumber("b", 123), 222);

  p.set("a", 111);

  t.true(p.hasAll());
  t.is(p.getNumber("a", 123), 111);
  t.is(p.getNumber("b", 123), 222);
});
