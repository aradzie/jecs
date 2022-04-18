import test from "ava";
import { Params, ParamsMap } from "./params.js";

test("validate device params", (t) => {
  t.deepEqual(new ParamsMap({}).build(), {});
  t.deepEqual(
    new ParamsMap({
      V: Params.number({ title: "value" }),
    })
      .setAll({ v: 1 })
      .build(),
    { V: 1 },
  );
  t.deepEqual(
    new ParamsMap({
      V: Params.number({ default: 1, title: "value" }),
    }).build(),
    { V: 1 },
  );
  t.throws(
    () => {
      new ParamsMap({}).setAll({ x: 0 });
    },
    { message: `Unknown parameter [x]` },
  );
  t.throws(
    () => {
      new ParamsMap({
        V: Params.number({ title: "value" }),
      }).setAll({ v: "omg" });
    },
    {
      message:
        `Invalid value for parameter [V], ` + //
        `expected a number, got "omg"`,
    },
  );
  t.throws(
    () => {
      new ParamsMap({
        V: Params.enum({ values: ["one", "two"], title: "value" }),
      }).setAll({ v: 1 });
    },
    {
      message:
        `Invalid value for parameter [V], ` + //
        `expected a string, got 1`,
    },
  );
  t.throws(
    () => {
      new ParamsMap({
        V: Params.enum({ values: ["one", "two"], title: "value" }),
      }).setAll({ v: "zero" });
    },
    {
      message:
        `Invalid value for parameter [V], ` + //
        `expected one of {"one", "two"}, got "zero"`,
    },
  );
  t.throws(
    () => {
      new ParamsMap({
        V: Params.number({ title: "value" }),
      }).build();
    },
    { message: `Missing parameter [V]` },
  );
});
