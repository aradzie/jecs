import { Method, SLE } from "@jecs/math/lib/sle.js";

export const interpolate = (x: Float64Array, y: Float64Array, size: number): Float64Array => {
  const sle = new SLE(size);
  for (let i = 0; i < size; i++) {
    sle.b[i] = y[i];
    let a = 1;
    for (let j = 0; j < size; j++) {
      sle.A[i][j] = a;
      a *= x[i];
    }
  }
  sle.solve(Method.Gauss);
  return new Float64Array(sle.x);
};

console.log(interpolate(new Float64Array([0, 1, 2]), new Float64Array([1, 1, 1]), 3));
console.log(interpolate(new Float64Array([0, 1, 2]), new Float64Array([0, 1, 2]), 3));
console.log(interpolate(new Float64Array([0, 1, 3]), new Float64Array([1, 0, 4]), 3));
