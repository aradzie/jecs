import test from "ava";
import { addFuncDef, callFunc } from "./functions";

test("check args", (t) => {
  t.throws(
    () => {
      callFunc("sin", [1, 2]);
    },
    {
      message: "Wrong number of arguments to function [sin]",
    },
  );
  t.throws(
    () => {
      callFunc("min", []);
    },
    {
      message: "Wrong number of arguments to function [min]",
    },
  );
});

test("call builtin func", (t) => {
  t.is(callFunc("sqrt", [9]), 3);
  t.is(callFunc("min", [3, 1, 2]), 1);
  t.is(callFunc("max", [3, 1, 2]), 3);
});

test("call custom func", (t) => {
  addFuncDef("dbl", [(a: number): number => a * 2, 1]);
  t.is(callFunc("dbl", [3]), 6);
});
