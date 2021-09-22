import test from "ava";
import { DeviceProps, Unit, validateDeviceProps } from "./device";

test("validate device props", (t) => {
  t.notThrows(() => {
    validateDeviceProps({ name: "Dev" }, []);
  });
  t.notThrows(() => {
    validateDeviceProps({ name: "Dev", v: 1 }, [
      { name: "v", unit: Unit.VOLT }, //
    ]);
  });
  t.notThrows(() => {
    validateDeviceProps({ name: "Dev" }, [
      { name: "v", unit: Unit.VOLT, default: 1 }, //
    ]);
  });
  t.throws(
    () => {
      validateDeviceProps({ name: "Dev" }, [
        { name: "v", unit: Unit.VOLT }, //
      ]);
    },
    { message: "Missing property [v]" },
  );
  t.throws(
    () => {
      validateDeviceProps({ name: "Dev", x: 0 }, []);
    },
    { message: "Unknown property [x]" },
  );
  t.deepEqual(
    validateDeviceProps({ name: "Dev" }, [
      { name: "v", unit: Unit.VOLT, default: 1 }, //
    ]),
    { name: "Dev", v: 1 } as DeviceProps,
  );
});
