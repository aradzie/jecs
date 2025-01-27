import { test } from "node:test";
import { deepEqual } from "rich-assert";
import { toMatrix } from "./debug.js";
import { findRookPivot } from "./pivot.js";

test("find rook pivot", () => {
  {
    const mat = toMatrix([[1]]);
    deepEqual(findRookPivot(mat, 1, 0), [0, 0]);
  }
  {
    const mat = toMatrix([
      [1, 10, 1, 2, 4, 5],
      [0, 5, 2, 7, 8, 2],
      [2, 0, 3, 1, 9, 4],
      [3, 2, 4, 2, 1, 0],
      [1, 4, 5, 6, 3, 1],
      [1, 0, 3, 4, 0, 12],
    ]);
    deepEqual(findRookPivot(mat, 6, 0), [2, 4]);
    deepEqual(findRookPivot(mat, 6, 1), [2, 4]);
    deepEqual(findRookPivot(mat, 6, 2), [4, 3]);
    deepEqual(findRookPivot(mat, 6, 3), [4, 3]);
    deepEqual(findRookPivot(mat, 6, 4), [4, 4]);
    deepEqual(findRookPivot(mat, 6, 5), [5, 5]);
  }
  {
    const mat = toMatrix([
      [0, 1],
      [0, 2],
    ]);
    deepEqual(findRookPivot(mat, 2, 0), [1, 1]);
    deepEqual(findRookPivot(mat, 2, 1), [1, 1]);
  }
  {
    const mat = toMatrix([
      [0, 0],
      [0, 0],
    ]);
    deepEqual(findRookPivot(mat, 2, 0), [0, 0]);
    deepEqual(findRookPivot(mat, 2, 1), [1, 1]);
  }
});
