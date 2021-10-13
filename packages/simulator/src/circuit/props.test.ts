import test from "ava";
import { Unit } from "../util/unit";
import { Props, validateProps } from "./props";

test("validate device props", (t) => {
  t.notThrows(() => {
    validateProps({}, {});
  });
  t.notThrows(() => {
    validateProps(
      { v: 1 },
      {
        v: Props.number({ title: "haha" }),
      },
    );
  });
  t.notThrows(() => {
    validateProps(
      {},
      {
        v: Props.number({ default: 1, title: "haha" }),
      },
    );
  });
  t.throws(
    () => {
      validateProps(
        {},
        {
          v: Props.number({ title: "haha" }),
        },
      );
    },
    { message: "Missing property [v]" },
  );
  t.throws(
    () => {
      validateProps({ x: 0 }, {});
    },
    { message: "Unknown property [x]" },
  );
  t.deepEqual(
    validateProps(
      {},
      {
        v: Props.number({
          default: 1,
          title: "haha",
        }),
      },
    ),
    { v: 1 },
  );
});
