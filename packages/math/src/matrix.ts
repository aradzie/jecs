import { assert } from "./assert.js";
import type { Matrix, MatrixLike, Vector, VectorLike } from "./types.js";

export function matSize(a: MatrixLike): [height: number, width: number] {
  return [a.length, a[0].length];
}

export function matMake(height: number, width: number): Matrix {
  const m = new Array<Vector>(height);
  for (let i = 0; i < height; i++) {
    m[i] = vecMake(width);
  }
  return m;
}

export function matClear(m: Matrix, x = 0): void {
  for (const row of m) {
    row.fill(x);
  }
}

export function matCopy(src: MatrixLike, dst: Matrix): void {
  const [aHeight, aWidth] = matSize(src);
  const [bHeight, bWidth] = matSize(dst);
  assert(aHeight === bHeight && aWidth === bWidth);
  for (let i = 0; i < aHeight; i++) {
    dst[i].set(src[i]);
  }
}

export function matMultiplyMat(a: MatrixLike, b: MatrixLike): Matrix {
  const [aHeight, aWidth] = matSize(a);
  const [bHeight, bWidth] = matSize(b);
  assert(aWidth === bHeight);
  const c = matMake(aHeight, bWidth);
  for (let i = 0; i < aHeight; i++) {
    for (let j = 0; j < bWidth; j++) {
      let x = 0;
      for (let k = 0; k < aWidth; k++) {
        x += a[i][k] * b[k][j];
      }
      c[i][j] = x;
    }
  }
  return c;
}

export function matMultiplyVec(a: MatrixLike, b: VectorLike): Vector {
  const [aHeight, aWidth] = matSize(a);
  assert(aWidth === b.length);
  const c = vecMake(aHeight);
  for (let i = 0; i < aHeight; i++) {
    let x = 0;
    for (let j = 0; j < aWidth; j++) {
      x += a[i][j] * b[j];
    }
    c[i] = x;
  }
  return c;
}

export function vecMake(size: number): Vector {
  return new Float64Array(size);
}

export function vecClear(v: Vector, x = 0): void {
  v.fill(x);
}

export function vecCopy(src: VectorLike, dst: Vector): void {
  assert(src.length === dst.length);
  dst.set(src);
}

export function swapRows<T>(m: { [index: number]: T }, a: number, b: number): void {
  const t = m[a];
  m[a] = m[b];
  m[b] = t;
}

export function swapColumns<T>(
  m: ArrayLike<{ [index: number]: T }>,
  size: number,
  a: number,
  b: number,
): void {
  for (let i = 0; i < size; i++) {
    const row = m[i];
    const t = row[a];
    row[a] = row[b];
    row[b] = t;
  }
}
