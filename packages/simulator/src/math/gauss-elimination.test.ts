import test from "ava";
import { toMatrix, toVector } from "./debug";
import { solve } from "./gauss-elimination";

test("solve", (t) => {
  {
    const x = solve(toMatrix([[2]]), toVector([6]));
    t.deepEqual([...x], [3]);
  }
  {
    const x = solve(
      toMatrix([
        [2, 1],
        [4, 1],
      ]),
      toVector([1, 1]),
    );
    t.deepEqual([...x], [0, 1]);
  }
  {
    const x = solve(
      toMatrix([
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ]),
      toVector([8, -11, -3]),
    );
    t.deepEqual([...x], [2, 3.0000000000000004, -0.9999999999999999]);
  }
  {
    const x = solve(
      toMatrix([
        [-3, 2, -1],
        [6, -6, 7],
        [3, -4, 4],
      ]),
      toVector([-1, -7, -6]),
    );
    t.deepEqual([...x], [2, 2, -1]);
  }
});
