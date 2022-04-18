import test from "ava";
import { toMatrix, toVector } from "./debug.js";
import { solve } from "./gauss-elimination.js";

test("solve", (t) => {
  {
    const a = toMatrix([[2]]);
    const b = toVector([6]);
    solve(a, b);
    t.deepEqual([...b], [3]);
  }
  {
    const a = toMatrix([
      [2, 1],
      [4, 1],
    ]);
    const b = toVector([1, 1]);
    solve(a, b);
    t.deepEqual([...b], [0, 1]);
  }
  {
    const a = toMatrix([
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2],
    ]);
    const b = toVector([8, -11, -3]);
    solve(a, b);
    t.deepEqual([...b], [2, 3.0000000000000004, -0.9999999999999999]);
  }
  {
    const a = toMatrix([
      [-3, 2, -1],
      [6, -6, 7],
      [3, -4, 4],
    ]);
    const b = toVector([-1, -7, -6]);
    solve(a, b);
    t.deepEqual([...b], [2, 2, -1]);
  }
});
