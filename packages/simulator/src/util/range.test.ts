import test from "ava";
import { linSpace, logSpace } from "./range.js";

const a = (v: Float64Array): number[] => [...v].map((v) => Math.round(v * 1000) / 1000);

test("linSpace", (t) => {
  t.throws(
    () => {
      linSpace(1, 10, 1);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      linSpace(1, 10, 2.1);
    },
    { instanceOf: TypeError },
  );
  t.deepEqual(a(linSpace(1, 10, 2)), [1, 10]);
  t.deepEqual(a(linSpace(-1, -10, 2)), [-1, -10]);
  t.deepEqual(a(linSpace(10, 1, 2)), [10, 1]);
  t.deepEqual(a(linSpace(-10, -1, 2)), [-10, -1]);
  t.deepEqual(a(linSpace(1, 10, 10)), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  t.deepEqual(a(linSpace(-1, -10, 10)), [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10]);
  t.deepEqual(a(linSpace(10, 1, 10)), [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  t.deepEqual(a(linSpace(-10, -1, 10)), [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1]);
});

test("logSpace", (t) => {
  t.throws(
    () => {
      logSpace(1, 10, 1);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      logSpace(1, 10, 2.1);
    },
    { instanceOf: TypeError },
  );
  t.deepEqual(a(logSpace(1, 1e1, 2)), [1, 1e1]);
  t.deepEqual(a(logSpace(1e1, 1, 2)), [1e1, 1]);
  t.deepEqual(a(logSpace(1, 1e-1, 2)), [1, 1e-1]);
  t.deepEqual(a(logSpace(1e-1, 1, 2)), [1e-1, 1]);
  t.deepEqual(a(logSpace(-1, -1e1, 2)), [-1, -1e1]);
  t.deepEqual(a(logSpace(-1e1, -1, 2)), [-1e1, -1]);
  t.deepEqual(a(logSpace(-1, -1e-1, 2)), [-1, -1e-1]);
  t.deepEqual(a(logSpace(-1e-1, -1, 2)), [-1e-1, -1]);
  t.deepEqual(a(logSpace(1e-3, 1e3, 7)), [1e-3, 1e-2, 1e-1, 1, 1e1, 1e2, 1e3]);
  t.deepEqual(a(logSpace(1e3, 1e-3, 7)), [1e3, 1e2, 1e1, 1, 1e-1, 1e-2, 1e-3]);
});
