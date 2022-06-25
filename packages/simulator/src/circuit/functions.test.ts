import test from "ava";
import { FunctionDef } from "./functions.js";

test("get function", (t) => {
  const exp = FunctionDef.get("exp");
  t.is(exp.name, "exp");
  t.is(exp.reqArgs, 1);
  t.is(exp.optArgs, 0);
  t.is(exp.varArgs, false);

  const min = FunctionDef.get("min");
  t.is(min.name, "min");
  t.is(min.reqArgs, 2);
  t.is(min.optArgs, 0);
  t.is(min.varArgs, true);

  t.throws(
    () => {
      exp.call([]);
    },
    { message: "Too few arguments to function [exp]" },
  );
  t.throws(
    () => {
      exp.call([1, 2]);
    },
    { message: "Too many arguments to function [exp]" },
  );
  t.throws(
    () => {
      min.call([]);
    },
    { message: "Too few arguments to function [min]" },
  );
  t.throws(
    () => {
      min.call([1]);
    },
    { message: "Too few arguments to function [min]" },
  );
  t.is(min.call([2, 1]), 1);
  t.is(min.call([3, 2, 1]), 1);
  t.is(min.call([4, 3, 2, 1]), 1);
});
