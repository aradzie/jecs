import type { Matrix, MatrixLike, Vector, VectorLike } from "./types";

export function toVector(data: VectorLike): Vector {
  return new Float64Array(data);
}

export function toMatrix(data: MatrixLike): Matrix {
  return Array.from(data).map((row) => toVector(row));
}

export function toArray(matrix: Matrix): number[][] {
  return Array.from(matrix).map((row) => [...row]);
}

export function dumpMatrix(m: MatrixLike): void {
  for (let i = 0; i < m.length; i++) {
    const row = m[i];
    const s = [];
    for (let j = 0; j < row.length; j++) {
      s.push(String(round(row[j])).padStart(5));
    }
    console.log(s.join("|"));
  }
}

export function round(n: number): number {
  return Math.round(n * 100) / 100;
}
