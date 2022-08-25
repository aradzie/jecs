import { examples, Func } from "./func.js";
import { methods } from "./methods.js";

const run = (func: Func): void => {
  for (const method of methods) {
    const [x, y] = method.run({
      f: func,
      h: 0.05,
      x1: func.x1,
      y1: func.y1,
      end: 10,
    });
    const exact = func.exact(x);
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

for (const example of examples) {
  console.log();
  console.log(`====================== ${example.name} ======================`);
  console.log();
  run(example);
}
