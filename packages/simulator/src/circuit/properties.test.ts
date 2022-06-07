import test from "ava";
import { Properties } from "./properties.js";

test("validate device properties", (t) => {
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
