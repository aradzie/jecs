import test from "ava";
import { toSle, vecToArray } from "./debug.js";
import { solveGauss } from "./solve-gauss.js";

test("solve", (t) => {
  {
    const sle = toSle([[2]], [6]);
    solveGauss(sle);
    t.deepEqual([...sle.x], [3]);
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
    solveGauss(sle);
    t.deepEqual(vecToArray(sle.x), [2, 3, -1]);
  }
});
