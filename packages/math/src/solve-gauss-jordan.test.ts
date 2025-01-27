import { test } from "node:test";
import { deepEqual } from "rich-assert";
import { toSle, vecToArray } from "./debug.js";
import { solveGaussJordan } from "./solve-gauss-jordan.js";

test("solve", () => {
  {
    const sle = toSle([[2]], [6]);
    solveGaussJordan(sle);
    deepEqual([...sle.x], [3]);
  }
  {
    const sle = toSle(
      [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      [8, -11, -3],
    );
    solveGaussJordan(sle);
    deepEqual(vecToArray(sle.x), [2, 3, -1]);
  }
});
