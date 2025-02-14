import { DeviceClass } from "@jecs/simulator/lib/circuit/device";

export type Props = Record<string, string>;

export function setProp(props: Props, name: string, value: string): Props {
  return Object.assign(Object.create(null), props, { [name]: value });
}

export function defaultProps(device: DeviceClass | null): Props {
  const props: Props = Object.create(null);
  if (device != null) {
    for (const [name, prop] of Object.entries(device.propsSchema)) {
      props[name] = String(prop.defaultValue || "");
    }
  }
  return props;
}
