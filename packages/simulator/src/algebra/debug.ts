export function toVector(data: ArrayLike<number>): Float64Array {
  return new Float64Array(data);
}

export function toMatrix(data: ArrayLike<ArrayLike<number>>): Float64Array[] {
  return Array.from(data).map((row) => new Float64Array(row));
}

export function toArray(matrix: ArrayLike<Float64Array>): number[][] {
  return Array.from(matrix).map((row) => [...row]);
}

export function dump(m: ArrayLike<ArrayLike<number>>) {
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
