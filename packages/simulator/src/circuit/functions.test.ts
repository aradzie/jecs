import { test } from "node:test";
import { equal, throws } from "rich-assert";
import { FunctionDef } from "./functions.js";

test("get function", () => {
  const exp = FunctionDef.get("exp");
  equal(exp.name, "exp");
  equal(exp.reqArgs, 1);
  equal(exp.optArgs, 0);
  equal(exp.varArgs, false);

  const min = FunctionDef.get("min");
  equal(min.name, "min");
  equal(min.reqArgs, 2);
  equal(min.optArgs, 0);
  equal(min.varArgs, true);

  throws(
    () => {
      exp.call([]);
    },
    { message: "Too few arguments to function [exp]" },
  );
  throws(
    () => {
      exp.call([1, 2]);
    },
    { message: "Too many arguments to function [exp]" },
  );
  throws(
    () => {
      min.call([]);
    },
    { message: "Too few arguments to function [min]" },
  );
  throws(
    () => {
      min.call([1]);
    },
    { message: "Too few arguments to function [min]" },
  );
  equal(min.call([2, 1]), 1);
  equal(min.call([3, 2, 1]), 1);
  equal(min.call([4, 3, 2, 1]), 1);
});
