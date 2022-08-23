export interface Func {
  (x: number, y: number): number;
  exact: (x: number) => number;
}

const func1: Func = (x, y) => y / 2;
func1.exact = (x) => Math.exp(x / 2);

const func2: Func = (x, y) => -(y * y);
func2.exact = (x) => 1 / (x + 1);

export { func1, func2 };
