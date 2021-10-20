import test from "ava";
import { Params, validateParams } from "./params";

test("validate device params", (t) => {
  t.notThrows(() => {
    validateParams({}, {});
  });
  t.notThrows(() => {
    validateParams(
      { v: 1 },
      {
        v: Params.number({ title: "haha" }),
      },
    );
  });
  t.notThrows(() => {
    validateParams(
      {},
      {
        v: Params.number({ default: 1, title: "haha" }),
      },
    );
  });
  t.throws(
    () => {
      validateParams(
        {},
        {
          v: Params.number({ title: "haha" }),
        },
      );
    },
    { message: "Missing parameter [v]" },
  );
  t.throws(
    () => {
      validateParams({ x: 0 }, {});
    },
    { message: "Unknown parameter [x]" },
  );
  t.deepEqual(
    validateParams(
      {},
      {
        v: Params.number({
          default: 1,
          title: "haha",
        }),
      },
    ),
    { v: 1 },
  );
});
