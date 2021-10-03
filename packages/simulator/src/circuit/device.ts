import type { Details } from "./details";
import type { Network, Node, Stamper } from "./network";
import type { DevicePropsSchema } from "./props";

// pin
// two-terminal, three-terminal, etc
// one-port
// two-port

export interface DeviceClass {
  readonly id: string;
  readonly numTerminals: number;
  readonly propsSchema: DevicePropsSchema;
  new (name: string, nodes: readonly Node[], props: any): Device;
}

export abstract class Device {
  static readonly id: string;
  static readonly numTerminals: number;
  static readonly propsSchema: DevicePropsSchema;

  readonly name: string;
  readonly nodes: Node[];

  constructor(name: string, nodes: readonly Node[]) {
    this.name = name;
    this.nodes = [...nodes];
  }

  /**
   * Circuit call this method to let a device
   * to allocate extra nodes and branches.
   * @param network A network which contains allocated nodes and branches.
   */
  connect(network: Network): void {}

  /**
   * Circuit calls this method to let a device
   * to stamp MNA matrix and RHS vector.
   * @param stamper A stamper which updates MNA matrix and RHS vector.
   */
  stamp(stamper: Stamper): void {}

  /**
   * Returns device details, such as voltage difference, current, etc.
   */
  details(): Details {
    return [];
  }
}
