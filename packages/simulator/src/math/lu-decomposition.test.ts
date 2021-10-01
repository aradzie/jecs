import test from "ava";
import { toMatrix, toVector } from "./debug";
import { createSolver } from "./lu-decomposition";

test("solve", (t) => {
  {
    const mat = toMatrix([[2]]);
    const solver = createSolver(mat);
    {
      const vec = toVector([6]);
      solver(vec);
      t.deepEqual([...vec], [3]);
    }
    {
      const vec = toVector([6]);
      solver(vec);
      t.deepEqual([...vec], [3]);
    }
  }
  {
    const mat = toMatrix([
      [2, 1],
      [4, 1],
    ]);
    const solver = createSolver(mat);
    {
      const vec = toVector([1, 1]);
      solver(vec);
      t.deepEqual([...vec], [0, 1]);
    }
    {
      const vec = toVector([1, 1]);
      solver(vec);
      t.deepEqual([...vec], [0, 1]);
    }
  }
  {
    const mat = toMatrix([
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2],
    ]);
    const solver = createSolver(mat);
    {
      const vec = toVector([8, -11, -3]);
      solver(vec);
      t.deepEqual(
        [...vec],
        [2.000000000000002, 2.999999999999999, -0.9999999999999971],
      );
    }
    {
      const vec = toVector([8, -11, -3]);
      solver(vec);
      t.deepEqual(
        [...vec],
        [2.000000000000002, 2.999999999999999, -0.9999999999999971],
      );
    }
  }
  {
    const mat = toMatrix([
      [-3, 2, -1],
      [6, -6, 7],
      [3, -4, 4],
    ]);
    const solver = createSolver(mat);
    {
      const vec = toVector([-1, -7, -6]);
      solver(vec);
      t.deepEqual([...vec], [2, 2, -1]);
    }
    {
      const vec = toVector([-1, -7, -6]);
      solver(vec);
      t.deepEqual([...vec], [2, 2, -1]);
    }
  }
});
