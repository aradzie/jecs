import { func1 } from "./func.js";
import type { Problem } from "./method.js";
import { methods } from "./methods.js";

const run = (problem: Problem): void => {
  for (const method of methods) {
    const [x, y] = method.run(problem);
    const exact = problem.f.exact(x);
    const err = Math.abs(y - exact) / exact;
    console.log(
      "%s  x=%s  y=%s  err=%s  iter=%d",
      method.name.padStart(30),
      x.toFixed(6),
      y.toFixed(6),
      err.toFixed(6),
      method.iter,
    );
  }
};

run({
  f: func1,
  h: 0.05,
  x1: 0,
  y1: 1,
  end: 10,
});
