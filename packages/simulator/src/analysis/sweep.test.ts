import { test } from "node:test";
import { deepEqual } from "rich-assert";
import { Sweep } from "./sweep.js";

test("sweep", () => {
  // Arrange.

  const sweep = new Sweep("x");

  // Act.

  sweep.properties.set("type", "lin");
  sweep.properties.set("start", 1);
  sweep.properties.set("stop", 5);
  sweep.properties.set("points", 5);

  // Assert.

  deepEqual([...sweep], [1, 2, 3, 4, 5]);

  // Act.

  sweep.properties.set("type", "lin");
  sweep.properties.set("start", 5);
  sweep.properties.set("stop", 1);
  sweep.properties.set("points", 5);

  // Assert.

  deepEqual([...sweep], [5, 4, 3, 2, 1]);
});
