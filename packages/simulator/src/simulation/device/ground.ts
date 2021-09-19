import type { Node, Stamper } from "../network";
import { Device, DeviceProps } from "./device";

export class Ground extends Device {
  static override readonly id = "g";
  static override readonly numTerminals = 1;

  readonly n: Node;

  constructor(
    [n]: readonly Node[],
    { name }: DeviceProps = { name: "GROUND" },
  ) {
    super([n], name);
    this.n = n;
  }

  override stamp(stamper: Stamper): void {}
}
