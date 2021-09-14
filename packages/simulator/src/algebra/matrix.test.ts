import test from "ava";
import { toArray, toMatrix } from "./debug";
import { matMakeIdentity, matMultiplyMat, matMultiplyVec } from "./matrix";

test("multiply matrix by matrix", (t) => {
  {
    const a = toMatrix([[2]]);
    const b = toMatrix([[3]]);
    const c = matMultiplyMat(a, b);
    t.deepEqual(toArray(c), [[6]]);
  }
  {
    const a = toMatrix([[1, 2, 3]]);
    const b = toMatrix([[4], [5], [6]]);
    const c = matMultiplyMat(a, b);
    const d = matMultiplyMat(b, a);
    t.deepEqual(toArray(c), [[32]]);
    t.deepEqual(toArray(d), [
      [4, 8, 12],
      [5, 10, 15],
      [6, 12, 18],
    ]);
  }
  {
    const data = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const a = toMatrix(data);
    const b = matMakeIdentity(3);
    const c = matMultiplyMat(a, b);
    const d = matMultiplyMat(b, a);
    t.deepEqual(toArray(c), data);
    t.deepEqual(toArray(d), data);
  }
});

test("multiply matrix by vector", (t) => {
  {
    const a = toMatrix([[2]]);
    const b = new Float64Array([3]);
    const c = matMultiplyVec(a, b);
    t.deepEqual([...c], [6]);
  }
  {
    const a = toMatrix([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    const b = new Float64Array([4, 5, 6]);
    const c = matMultiplyVec(a, b);
    t.deepEqual([...c], [32, 77]);
  }
});
