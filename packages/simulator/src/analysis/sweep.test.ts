import { test } from "node:test";
import { deepEqual } from "rich-assert";
import { Sweep } from "./sweep.js";

test("sweep", () => {
  // Arrange.

  const sweep = new Sweep("x");

  // Act.

  sweep.props.set("type", "lin");
  sweep.props.set("start", 1);
  sweep.props.set("stop", 5);
  sweep.props.set("points", 5);

  // Assert.

  deepEqual([...sweep], [1, 2, 3, 4, 5]);

  // Act.

  sweep.props.set("type", "lin");
  sweep.props.set("start", 5);
  sweep.props.set("stop", 1);
  sweep.props.set("points", 5);

  // Assert.

  deepEqual([...sweep], [5, 4, 3, 2, 1]);
});
