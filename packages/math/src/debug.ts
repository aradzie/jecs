import { matCopy, vecCopy } from "./matrix.js";
import { Sle } from "./sle.js";
import { type Matrix, type MatrixLike, type Vector, type VectorLike } from "./types.js";

export function toSle(A: MatrixLike, b: VectorLike): Sle {
  const sle = new Sle(b.length);
  matCopy(A, sle.A);
  vecCopy(b, sle.b);
  return sle;
}

export function toVector(data: VectorLike): Vector {
  return new Float64Array(data);
}

export function toMatrix(data: MatrixLike): Matrix {
  return Array.from(data).map((row) => toVector(row));
}

export function matToArray(matrix: Matrix): number[][] {
  return Array.from(matrix).map((row) => vecToArray(row));
}

export function vecToArray(vector: Vector): number[] {
  return Array.from(vector).map((v) => round(v));
}

export function dumpMatrix(m: MatrixLike, separator = "|"): void {
  for (let i = 0; i < m.length; i++) {
    const row = m[i];
    const s = [];
    for (let j = 0; j < row.length; j++) {
      s.push(printValue(row[j]));
    }
    console.log(s.join(separator));
  }
}

export function dumpVector(v: VectorLike, separator = "|"): void {
  const s = [];
  for (let i = 0; i < v.length; i++) {
    s.push(printValue(v[i]));
  }
  console.log(s.join(separator));
}

export function dumpSle(m: MatrixLike, v: VectorLike, separator = "|"): void {
  for (let i = 0; i < m.length; i++) {
    const row = m[i];
    const s = [];
    for (let j = 0; j < row.length; j++) {
      s.push(String(round(row[j])).padStart(7));
    }
    s.push(printValue(v[i]));
    console.log(s.join(separator));
  }
}

function printValue(x: number): string {
  return String(round(x)).padStart(7);
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
