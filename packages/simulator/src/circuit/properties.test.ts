import test from "ava";
import { Properties } from "./properties.js";

test("validate properties", (t) => {
  t.throws(
    () => {
      new Properties({
        a: Properties.number({ title: "a" }),
        b: Properties.number({ title: "b" }),
      }).set("x", 0);
    },
    { message: `Unknown property [x]. Expected one of [a], [b].` },
  );
});

test("validate number properties", (t) => {
  t.throws(
    () => {
      new Properties({
        prop: Properties.number({ title: "value" }),
      }).set("prop", "omg");
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected a number, got "omg".`,
    },
  );
  t.throws(
    () => {
      new Properties({
        prop: Properties.number({ title: "value" }),
      }).set("prop", NaN);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Not a finite value.`,
    },
  );
  t.throws(
    () => {
      new Properties({
        prop: Properties.number({ title: "value", range: ["integer"] }),
      }).set("prop", 0.1);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Not an integer value.`,
    },
  );
  t.throws(
    () => {
      new Properties({
        prop: Properties.number({ title: "value", range: ["real", ">", 0] }),
      }).set("prop", 0);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected a value larger than 0, got 0.`,
    },
  );
  t.throws(
    () => {
      new Properties({
        prop: Properties.number({ title: "value", range: ["real", "<", 0] }),
      }).set("prop", 0);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected a value less than 0, got 0.`,
    },
  );
  t.throws(
    () => {
      new Properties({
        prop: Properties.number({ title: "value", range: ["real", "<>", 0] }),
      }).set("prop", 0);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected a value not equal to 0.`,
    },
  );
});

test("validate string properties", (t) => {
  t.throws(
    () => {
      new Properties({
        prop: Properties.string({ range: ["one", "two"], title: "value" }),
      }).set("prop", 1);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected a string, got 1.`,
    },
  );
  t.throws(
    () => {
      new Properties({
        prop: Properties.string({ range: ["one", "two"], title: "value" }),
      }).set("prop", "zero");
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected one of "one", "two", got "zero".`,
    },
  );
});

test("get properties", (t) => {
  const p = new Properties({
    a: Properties.number({ defaultValue: 1, title: "a" }),
    b: Properties.number({ title: "b" }),
    c: Properties.string({ title: "c" }),
  });

  t.false(p.hasAll());
  t.is(p.getNumber("a"), 1);
  t.is(p.getNumber("a", 123), 123);
  t.is(p.getNumber("b", 123), 123);
  t.is(p.getString("c", "abc"), "abc");

  p.set("b", 222);

  t.false(p.hasAll());
  t.is(p.getNumber("b"), 222);
  t.is(p.getNumber("b", 123), 222);

  p.set("c", "xyz");

  t.true(p.hasAll());
  t.is(p.getString("c"), "xyz");
  t.is(p.getString("c", "abc"), "xyz");

  p.set("a", 111);

  t.true(p.hasAll());
  t.is(p.getNumber("a"), 111);
  t.is(p.getNumber("a", 123), 111);
});
