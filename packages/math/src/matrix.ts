import type { Matrix, MatrixLike, Vector, VectorLike } from "./types.js";

export function matMake(size: number): Matrix {
  const m = new Array<Vector>(size);
  for (let i = 0; i < size; i++) {
    m[i] = vecMake(size);
  }
  return m;
}

export function matClear(m: Matrix, x = 0): void {
  for (const row of m) {
    row.fill(x);
  }
}

export function matCopy(a: MatrixLike, b: Matrix): void {
  const size = a.length;
  for (let i = 0; i < size; i++) {
    b[i].set(a[i]);
  }
}

export function vecMake(size: number): Vector {
  return new Float64Array(size);
}

export function vecClear(v: Vector, x = 0): void {
  v.fill(x);
}

export function vecCopy(a: VectorLike, b: Vector): void {
  b.set(a);
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
