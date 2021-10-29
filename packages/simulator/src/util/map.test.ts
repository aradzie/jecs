import test from "ava";
import { NameMap } from "./map";

test("add unique keys", (t) => {
  const map = new NameMap<number>([
    ["AA", 1],
    ["BB", 2],
  ]);
  t.deepEqual(
    [...map],
    [
      ["AA", 1],
      ["BB", 2],
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

test("add non-unique keys", (t) => {
  const map = new NameMap<number>();

  t.deepEqual([...map], []);
  t.is(map.size, 0);

  // Update.

  map.set("XX", 0);
  map.set("AA", 1);

  // Assert.

  t.deepEqual(
    [...map],
    [
      ["XX", 0],
      ["AA", 1],
    ],
  );
  t.is(map.size, 2);
  t.true(map.has("AA"));
  t.is(map.get("AA"), 1);
  t.true(map.has("aa"));
  t.is(map.get("aa"), 1);
  t.true(map.has("Aa"));
  t.is(map.get("Aa"), 1);
  t.true(map.has("aA"));
  t.is(map.get("aA"), 1);

  // Update.

  map.set("aa", 2);

  // Assert.

  t.deepEqual(
    [...map],
    [
      ["XX", 0],
      ["AA", 1],
      ["aa", 2],
    ],
  );
  t.is(map.size, 3);
  t.true(map.has("AA"));
  t.is(map.get("AA"), 1);
  t.true(map.has("aa"));
  t.is(map.get("aa"), 2);
  t.false(map.has("Aa"));
  t.is(map.get("Aa"), null);
  t.false(map.has("aA"));
  t.is(map.get("aA"), null);

  // Update.

  map.set("Aa", 3);

  // Assert.

  t.deepEqual(
    [...map],
    [
      ["XX", 0],
      ["AA", 1],
      ["aa", 2],
      ["Aa", 3],
    ],
  );
  t.is(map.size, 4);
  t.true(map.has("AA"));
  t.is(map.get("AA"), 1);
  t.true(map.has("aa"));
  t.is(map.get("aa"), 2);
  t.true(map.has("Aa"));
  t.is(map.get("Aa"), 3);
  t.false(map.has("aA"));
  t.is(map.get("aA"), null);
});

test("add duplicate keys", (t) => {
  const map = new NameMap<number>();

  map.set("AA", 1);

  t.throws(() => {
    map.set("AA", 2);
  });

  t.deepEqual([...map], [["AA", 1]]);
  t.is(map.size, 1);
});
