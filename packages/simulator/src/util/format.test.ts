import { test } from "node:test";
import { equal } from "rich-assert";
import { humanizeNumber, toExponential } from "./format.js";

test("format number", () => {
  equal(humanizeNumber(NaN), "NaN");
  equal(humanizeNumber(NaN, "V"), "NaN");
  equal(humanizeNumber(-Infinity), "-Infinity");
  equal(humanizeNumber(-Infinity, "V"), "-Infinity");
  equal(humanizeNumber(Infinity), "+Infinity");
  equal(humanizeNumber(Infinity, "V"), "+Infinity");

  equal(humanizeNumber(-1), "-1");
  equal(humanizeNumber(-1, "V"), "-1V");
  equal(humanizeNumber(1), "1");
  equal(humanizeNumber(1, "V"), "1V");

  equal(humanizeNumber(123e-18), "0");
  equal(humanizeNumber(123e-17), "0.001p");
  equal(humanizeNumber(123e-16), "0.012p");
  equal(humanizeNumber(123.456e-15), "0.123p");
  equal(humanizeNumber(123e-15), "0.123p");
  equal(humanizeNumber(123.456e-14), "1.235p");
  equal(humanizeNumber(123e-14), "1.23p");
  equal(humanizeNumber(123.456e-13), "12.346p");
  equal(humanizeNumber(123e-13), "12.3p");
  equal(humanizeNumber(123.456e-12), "123.456p");
  equal(humanizeNumber(123e-12), "123p");
  equal(humanizeNumber(123.456e-11), "1.235n");
  equal(humanizeNumber(123e-11), "1.23n");
  equal(humanizeNumber(123.456e-10), "12.346n");
  equal(humanizeNumber(123e-10), "12.3n");
  equal(humanizeNumber(123.456e-9), "123.456n");
  equal(humanizeNumber(123e-9), "123n");
  equal(humanizeNumber(123.456e-8), "1.235μ");
  equal(humanizeNumber(123e-8), "1.23μ");
  equal(humanizeNumber(123.456e-7), "12.346μ");
  equal(humanizeNumber(123e-7), "12.3μ");
  equal(humanizeNumber(123.456e-6), "123.456μ");
  equal(humanizeNumber(123e-6), "123μ");
  equal(humanizeNumber(123.456e-5), "1.235m");
  equal(humanizeNumber(123e-5), "1.23m");
  equal(humanizeNumber(123.456e-4), "12.346m");
  equal(humanizeNumber(123e-4), "12.3m");
  equal(humanizeNumber(123.456e-3), "123.456m");
  equal(humanizeNumber(123e-3), "123m");
  equal(humanizeNumber(123.456e-2), "1.235");
  equal(humanizeNumber(123e-2), "1.23");
  equal(humanizeNumber(123.456e-1), "12.346");
  equal(humanizeNumber(123e-1), "12.3");
  equal(humanizeNumber(123.456), "123.456");
  equal(humanizeNumber(123), "123");
  equal(humanizeNumber(123.456e1), "1.235k");
  equal(humanizeNumber(123e1), "1.23k");
  equal(humanizeNumber(123.456e2), "12.346k");
  equal(humanizeNumber(123e2), "12.3k");
  equal(humanizeNumber(123.456e3), "123.456k");
  equal(humanizeNumber(123e3), "123k");
  equal(humanizeNumber(123.456e4), "1.235M");
  equal(humanizeNumber(123e4), "1.23M");
  equal(humanizeNumber(123.456e5), "12.346M");
  equal(humanizeNumber(123e5), "12.3M");
  equal(humanizeNumber(123.456e6), "123.456M");
  equal(humanizeNumber(123e6), "123M");
  equal(humanizeNumber(123.456e7), "1.235G");
  equal(humanizeNumber(123e7), "1.23G");
  equal(humanizeNumber(123.456e8), "12.346G");
  equal(humanizeNumber(123e8), "12.3G");
  equal(humanizeNumber(123.456e9), "123.456G");
  equal(humanizeNumber(123e9), "123G");
});

test("to exponential", () => {
  const exp1 = toExponential(1);
  const exp3 = toExponential(3);

  equal(exp3(NaN), "NaN");
  equal(exp3(Infinity), "+Infinity");
  equal(exp3(-Infinity), "-Infinity");

  equal(exp1(0), "+0.0e+000");
  equal(exp3(0), "+0.000e+000");

  equal(exp3(Number.MIN_VALUE), "+4.941e-324");
  equal(exp3(-Number.MIN_VALUE), "-4.941e-324");
  equal(exp3(Number.MAX_VALUE), "+1.798e+308");
  equal(exp3(-Number.MAX_VALUE), "-1.798e+308");

  equal(exp1(1e3), "+1.0e+003");
  equal(exp3(1e3), "+1.000e+003");
  equal(exp1(1e-3), "+1.0e-003");
  equal(exp3(1e-3), "+1.000e-003");

  equal(exp1(1e13), "+1.0e+013");
  equal(exp3(1e13), "+1.000e+013");
  equal(exp1(1e-13), "+1.0e-013");
  equal(exp3(1e-13), "+1.000e-013");

  equal(exp1(-1e3), "-1.0e+003");
  equal(exp3(-1e3), "-1.000e+003");
  equal(exp1(-1e-3), "-1.0e-003");
  equal(exp3(-1e-3), "-1.000e-003");

  equal(exp1(-1e13), "-1.0e+013");
  equal(exp3(-1e13), "-1.000e+013");
  equal(exp1(-1e-13), "-1.0e-013");
  equal(exp3(-1e-13), "-1.000e-013");
});
