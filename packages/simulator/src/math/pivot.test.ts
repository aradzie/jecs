import test from "ava";
import { toMatrix } from "./debug";
import { findPivotCol, findPivotRow, findRookPivot } from "./pivot";

test("find pivot row", (t) => {
  {
    const mat = toMatrix([[1]]);
    t.deepEqual(findPivotRow(mat, 1, 0, 0), [1, 0]);
  }
  {
    const mat = toMatrix([
      [1, 2],
      [3, 4],
    ]);
    t.deepEqual(findPivotRow(mat, 2, 0, 0), [3, 1]);
    t.deepEqual(findPivotRow(mat, 2, 1, 0), [3, 1]);
    t.deepEqual(findPivotRow(mat, 2, 0, 1), [4, 1]);
    t.deepEqual(findPivotRow(mat, 2, 1, 1), [4, 1]);
  }
});

test("find pivot col", (t) => {
  {
    const mat = toMatrix([[1]]);
    t.deepEqual(findPivotCol(mat, 1, 0, 0), [1, 0]);
  }
  {
    const mat = toMatrix([
      [1, 2],
      [3, 4],
    ]);
    t.deepEqual(findPivotCol(mat, 2, 0, 0), [2, 1]);
    t.deepEqual(findPivotCol(mat, 2, 0, 1), [2, 1]);
    t.deepEqual(findPivotCol(mat, 2, 1, 0), [4, 1]);
    t.deepEqual(findPivotCol(mat, 2, 1, 1), [4, 1]);
  }
});

test("find rook pivot", (t) => {
  {
    const mat = toMatrix([[1]]);
    t.deepEqual(findRookPivot(mat, 1, 0), [0, 0]);
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
    t.deepEqual(findRookPivot(mat, 6, 0), [2, 4]);
    t.deepEqual(findRookPivot(mat, 6, 1), [2, 4]);
    t.deepEqual(findRookPivot(mat, 6, 2), [4, 3]);
    t.deepEqual(findRookPivot(mat, 6, 3), [4, 3]);
    t.deepEqual(findRookPivot(mat, 6, 4), [4, 4]);
    t.deepEqual(findRookPivot(mat, 6, 5), [5, 5]);
  }
  {
    const mat = toMatrix([
      [0, 1],
      [0, 2],
    ]);
    t.deepEqual(findRookPivot(mat, 2, 0), [1, 1]);
    t.deepEqual(findRookPivot(mat, 2, 1), [1, 1]);
  }
  {
    const mat = toMatrix([
      [0, 0],
      [0, 0],
    ]);
    t.deepEqual(findRookPivot(mat, 2, 0), [0, 0]);
    t.deepEqual(findRookPivot(mat, 2, 1), [1, 1]);
  }
});
