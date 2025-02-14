import { test } from "node:test";
import { equal, isFalse, isTrue, throws } from "rich-assert";
import { Props } from "./props.js";

test("validate props", () => {
  throws(
    () => {
      new Props({
        a: Props.number({ title: "a" }),
        b: Props.number({ title: "b" }),
      }).set("x", 0);
    },
    { message: `Unknown property [x]. Expected one of [a], [b].` },
  );
});

test("validate number props", () => {
  throws(
    () => {
      new Props({
        prop: Props.number({ title: "value" }),
      }).set("prop", "omg");
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected a number, got "omg".`,
    },
  );
  throws(
    () => {
      new Props({
        prop: Props.number({ title: "value" }),
      }).set("prop", NaN);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Not a finite value.`,
    },
  );
  throws(
    () => {
      new Props({
        prop: Props.number({ title: "value", range: ["integer"] }),
      }).set("prop", 0.1);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Not an integer value.`,
    },
  );
  throws(
    () => {
      new Props({
        prop: Props.number({ title: "value", range: ["real", ">", 0] }),
      }).set("prop", 0);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected a value larger than 0, got 0.`,
    },
  );
  throws(
    () => {
      new Props({
        prop: Props.number({ title: "value", range: ["real", "<", 0] }),
      }).set("prop", 0);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected a value less than 0, got 0.`,
    },
  );
  throws(
    () => {
      new Props({
        prop: Props.number({ title: "value", range: ["real", "<>", 0] }),
      }).set("prop", 0);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected a value not equal to 0.`,
    },
  );
});

test("validate string props", () => {
  throws(
    () => {
      new Props({
        prop: Props.string({ range: ["one", "two"], title: "value" }),
      }).set("prop", 1);
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected a string, got 1.`,
    },
  );
  throws(
    () => {
      new Props({
        prop: Props.string({ range: ["one", "two"], title: "value" }),
      }).set("prop", "zero");
    },
    {
      message:
        `Invalid value for property [prop]. ` + //
        `Expected one of "one", "two", got "zero".`,
    },
  );
});

test("get props", () => {
  const p = new Props({
    a: Props.number({ defaultValue: 1, title: "a" }),
    b: Props.number({ title: "b" }),
    c: Props.string({ title: "c" }),
  });

  isFalse(p.hasAll());
  equal(p.getNumber("a"), 1);
  equal(p.getNumber("a", 123), 123);
  equal(p.getNumber("b", 123), 123);
  equal(p.getString("c", "abc"), "abc");

  p.set("b", 222);

  isFalse(p.hasAll());
  equal(p.getNumber("b"), 222);
  equal(p.getNumber("b", 123), 222);

  p.set("c", "xyz");

  isTrue(p.hasAll());
  equal(p.getString("c"), "xyz");
  equal(p.getString("c", "abc"), "xyz");

  p.set("a", 111);

  isTrue(p.hasAll());
  equal(p.getNumber("a"), 111);
  equal(p.getNumber("a", 123), 111);
});
