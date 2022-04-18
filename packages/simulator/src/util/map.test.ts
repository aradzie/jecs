import test from "ava";
import { NameMap } from "./map.js";

test("add keys", (t) => {
  const map = new NameMap<number>([
    ["AA", 1],
    ["BB", 2],
  ]);
  t.deepEqual(
    [...map],
    [
      ["aa", 1],
      ["bb", 2],
    ],
  );
  t.is(map.size, 2);
  t.false(map.has("x"));
  t.is(map.get("x"), null);
  t.true(map.has("aa"));
  t.is(map.get("aa"), 1);
  t.true(map.has("AA"));
  t.is(map.get("AA"), 1);
  t.true(map.has("bb"));
  t.is(map.get("bb"), 2);
  t.true(map.has("BB"));
  t.is(map.get("BB"), 2);
});
