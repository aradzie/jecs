import type { Details } from "./details";
import type { Network, Node, Stamper } from "./network";
import type { PropsSchema } from "./props";

// pin
// two-terminal, three-terminal, etc
// one-port
// two-port

export interface DeviceClass {
  readonly id: string;
  readonly numTerminals: number;
  readonly propsSchema: PropsSchema;
  new (name: string, nodes: readonly Node[], props: any): Device;
}

export abstract class Device<PropsT = unknown, StateT = unknown> {
  static readonly id: string;
  static readonly numTerminals: number;
  static readonly propsSchema: PropsSchema;

  readonly name: string;
  readonly nodes: Node[];
  readonly props: PropsT;

  constructor(name: string, nodes: readonly Node[], props: PropsT) {
    this.name = name;
    this.nodes = [...nodes];
    this.props = { ...props };
  }

  /**
   * Circuit calls this method to let a device
   * to allocate extra nodes and branches.
   * @param network A network which contains allocated nodes and branches.
   */
  connect(network: Network): void {}

  /**
   * Returns a device state object which is shared between iterations.
   * This allows running multiple analyses on the same circuit.
   */
  getInitialState(): StateT {
    return {} as StateT;
  }

  /**
   * Circuit calls this method to let a device
   * to stamp MNA matrix and RHS vector.
   * @param stamper A stamper which updates MNA matrix and RHS vector.
   * @param state Device state which is saved between iterations.
   */
  stamp(stamper: Stamper, state: StateT): void {}

  /**
   * Returns device details, such as voltage difference, current, etc.
   */
  details(): Details {
    return [];
  }
}
