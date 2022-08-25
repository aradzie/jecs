export interface Func {
  (x: number, y: number): number;
  x1: number;
  y1: number;
  exact: (x: number) => number;
}

export const constant: Func = (x, y) => 0;
constant.x1 = 0;
constant.y1 = 1;
constant.exact = (x) => 1;

export const linear: Func = (x, y) => 1;
linear.x1 = 0;
linear.y1 = 0;
linear.exact = (x) => x;

export const example1: Func = (x, y) => y / 2;
example1.x1 = 0;
example1.y1 = 1;
example1.exact = (x) => Math.exp(x / 2);

export const example2: Func = (x, y) => -(y * y);
example2.x1 = 0;
example2.y1 = 1;
example2.exact = (x) => 1 / (x + 1);

export const examples: readonly Func[] = [
  constant, //
  linear,
  example1,
  example2,
];
