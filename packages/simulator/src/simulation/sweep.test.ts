import test from "ava";
import { Sweep } from "./sweep.js";

test("sweep", (t) => {
  t.deepEqual([...new Sweep("R1", "R", 1, 5, 5)], [1, 2, 3, 4, 5]);
  t.deepEqual([...new Sweep("R1", "R", 5, 1, 5)], [5, 4, 3, 2, 1]);
});
