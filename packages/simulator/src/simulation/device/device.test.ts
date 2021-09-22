import test from "ava";
import { Unit, validateDeviceProps } from "./device";

test("validate device props", (t) => {
  t.notThrows(() => {
    validateDeviceProps({}, []);
  });
  t.notThrows(() => {
    validateDeviceProps({ v: 1 }, [
      { name: "v", unit: Unit.VOLT }, //
    ]);
  });
  t.notThrows(() => {
    validateDeviceProps({}, [
      { name: "v", unit: Unit.VOLT, default: 1 }, //
    ]);
  });
  t.throws(
    () => {
      validateDeviceProps({}, [
        { name: "v", unit: Unit.VOLT }, //
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
      { name: "v", unit: Unit.VOLT, default: 1 }, //
    ]),
    { v: 1 },
  );
});
