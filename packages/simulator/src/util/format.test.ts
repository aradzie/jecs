import test from "ava";
import { humanizeNumber, toExponential } from "./format.js";

test("format number", (t) => {
  t.is(humanizeNumber(NaN), "NaN");
  t.is(humanizeNumber(NaN, "V"), "NaN");
  t.is(humanizeNumber(-Infinity), "-Infinity");
  t.is(humanizeNumber(-Infinity, "V"), "-Infinity");
  t.is(humanizeNumber(Infinity), "+Infinity");
  t.is(humanizeNumber(Infinity, "V"), "+Infinity");

  t.is(humanizeNumber(-1), "-1");
  t.is(humanizeNumber(-1, "V"), "-1V");
  t.is(humanizeNumber(1), "1");
  t.is(humanizeNumber(1, "V"), "1V");

  t.is(humanizeNumber(123e-18), "0");
  t.is(humanizeNumber(123e-17), "0.001p");
  t.is(humanizeNumber(123e-16), "0.012p");
  t.is(humanizeNumber(123.456e-15), "0.123p");
  t.is(humanizeNumber(123e-15), "0.123p");
  t.is(humanizeNumber(123.456e-14), "1.235p");
  t.is(humanizeNumber(123e-14), "1.23p");
  t.is(humanizeNumber(123.456e-13), "12.346p");
  t.is(humanizeNumber(123e-13), "12.3p");
  t.is(humanizeNumber(123.456e-12), "123.456p");
  t.is(humanizeNumber(123e-12), "123p");
  t.is(humanizeNumber(123.456e-11), "1.235n");
  t.is(humanizeNumber(123e-11), "1.23n");
  t.is(humanizeNumber(123.456e-10), "12.346n");
  t.is(humanizeNumber(123e-10), "12.3n");
  t.is(humanizeNumber(123.456e-9), "123.456n");
  t.is(humanizeNumber(123e-9), "123n");
  t.is(humanizeNumber(123.456e-8), "1.235μ");
  t.is(humanizeNumber(123e-8), "1.23μ");
  t.is(humanizeNumber(123.456e-7), "12.346μ");
  t.is(humanizeNumber(123e-7), "12.3μ");
  t.is(humanizeNumber(123.456e-6), "123.456μ");
  t.is(humanizeNumber(123e-6), "123μ");
  t.is(humanizeNumber(123.456e-5), "1.235m");
  t.is(humanizeNumber(123e-5), "1.23m");
  t.is(humanizeNumber(123.456e-4), "12.346m");
  t.is(humanizeNumber(123e-4), "12.3m");
  t.is(humanizeNumber(123.456e-3), "123.456m");
  t.is(humanizeNumber(123e-3), "123m");
  t.is(humanizeNumber(123.456e-2), "1.235");
  t.is(humanizeNumber(123e-2), "1.23");
  t.is(humanizeNumber(123.456e-1), "12.346");
  t.is(humanizeNumber(123e-1), "12.3");
  t.is(humanizeNumber(123.456), "123.456");
  t.is(humanizeNumber(123), "123");
  t.is(humanizeNumber(123.456e1), "1.235k");
  t.is(humanizeNumber(123e1), "1.23k");
  t.is(humanizeNumber(123.456e2), "12.346k");
  t.is(humanizeNumber(123e2), "12.3k");
  t.is(humanizeNumber(123.456e3), "123.456k");
  t.is(humanizeNumber(123e3), "123k");
  t.is(humanizeNumber(123.456e4), "1.235M");
  t.is(humanizeNumber(123e4), "1.23M");
  t.is(humanizeNumber(123.456e5), "12.346M");
  t.is(humanizeNumber(123e5), "12.3M");
  t.is(humanizeNumber(123.456e6), "123.456M");
  t.is(humanizeNumber(123e6), "123M");
  t.is(humanizeNumber(123.456e7), "1.235G");
  t.is(humanizeNumber(123e7), "1.23G");
  t.is(humanizeNumber(123.456e8), "12.346G");
  t.is(humanizeNumber(123e8), "12.3G");
  t.is(humanizeNumber(123.456e9), "123.456G");
  t.is(humanizeNumber(123e9), "123G");
});

test("to exponential", (t) => {
  const exp1 = toExponential(1);
  const exp3 = toExponential(3);

  t.is(exp3(NaN), "NaN");
  t.is(exp3(Infinity), "+Infinity");
  t.is(exp3(-Infinity), "-Infinity");

  t.is(exp1(0), "+0.0e+000");
  t.is(exp3(0), "+0.000e+000");

  t.is(exp3(Number.MIN_VALUE), "+4.941e-324");
  t.is(exp3(-Number.MIN_VALUE), "-4.941e-324");
  t.is(exp3(Number.MAX_VALUE), "+1.798e+308");
  t.is(exp3(-Number.MAX_VALUE), "-1.798e+308");

  t.is(exp1(1e3), "+1.0e+003");
  t.is(exp3(1e3), "+1.000e+003");
  t.is(exp1(1e-3), "+1.0e-003");
  t.is(exp3(1e-3), "+1.000e-003");

  t.is(exp1(1e13), "+1.0e+013");
  t.is(exp3(1e13), "+1.000e+013");
  t.is(exp1(1e-13), "+1.0e-013");
  t.is(exp3(1e-13), "+1.000e-013");

  t.is(exp1(-1e3), "-1.0e+003");
  t.is(exp3(-1e3), "-1.000e+003");
  t.is(exp1(-1e-3), "-1.0e-003");
  t.is(exp3(-1e-3), "-1.000e-003");

  t.is(exp1(-1e13), "-1.0e+013");
  t.is(exp3(-1e13), "-1.000e+013");
  t.is(exp1(-1e-13), "-1.0e-013");
  t.is(exp3(-1e-13), "-1.000e-013");
});
