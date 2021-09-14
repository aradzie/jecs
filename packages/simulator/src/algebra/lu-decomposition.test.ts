import test from "ava";
import { toMatrix, toVector } from "./debug";
import { createSolver } from "./lu-decomposition";

test("solve", (t) => {
  {
    const solver = createSolver(toMatrix([[2]]));
    const x = solver.solve(toVector([6]));
    t.deepEqual([...x], [3]);
  }
  {
    const solver = createSolver(
      toMatrix([
        [2, 1],
        [4, 1],
      ]),
    );
    const x = solver.solve(toVector([1, 1]));
    t.deepEqual([...x], [0, 1]);
  }
  {
    const solver = createSolver(
      toMatrix([
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ]),
    );
    const x = solver.solve(toVector([8, -11, -3]));
    t.deepEqual(
      [...x],
      [2.000000000000002, 2.999999999999999, -0.9999999999999971],
    );
  }
  {
    const solver = createSolver(
      toMatrix([
        [-3, 2, -1],
        [6, -6, 7],
        [3, -4, 4],
      ]),
    );
    const x = solver.solve(toVector([-1, -7, -6]));
    t.deepEqual([...x], [2, 2, -1]);
  }
});
