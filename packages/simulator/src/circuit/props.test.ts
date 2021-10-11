import test from "ava";
import { Unit } from "../util/unit";
import { validateDeviceProps } from "./props";

test("validate device props", (t) => {
  t.notThrows(() => {
    validateDeviceProps({}, []);
  });
  t.notThrows(() => {
    validateDeviceProps({ v: 1 }, [
      { name: "v", unit: Unit.VOLT, title: "haha" }, //
    ]);
  });
  t.notThrows(() => {
    validateDeviceProps({}, [
      { name: "v", unit: Unit.VOLT, default: 1, title: "haha" }, //
    ]);
  });
  t.throws(
    () => {
      validateDeviceProps({}, [
        { name: "v", unit: Unit.VOLT, title: "haha" }, //
      ]);
    },
    { message: "Missing property [v]" },
  );
  t.throws(
    () => {
      validateDeviceProps({ x: 0 }, []);
    },
    { message: "Unknown property [x]" },
  );
  t.deepEqual(
    validateDeviceProps({}, [
      { name: "v", unit: Unit.VOLT, default: 1, title: "haha" },
    ]),
    { v: 1 },
  );
});
