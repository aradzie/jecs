import type { Stamper } from "./mna.js";
import type { Network, Node } from "./network.js";
import type { Probe } from "./probe.js";
import { Properties, PropertiesSchema } from "./properties.js";

export interface DeviceClass {
  /** Unique device class identifier. */
  readonly id: string;
  /** The number of terminals in the device. */
  readonly numTerminals: number;
  /** Number of elements in the state vector. */
  readonly stateSize: number;
  /** Schema of the device parameters. */
  readonly propertiesSchema: PropertiesSchema;
  /** Whether this device is linear. */
  readonly linear: boolean;

  /**
   * Device constructor.
   * @param id Unique device instance identifier.
   */
  new (id: string): Device;
}

/**
 * Device states are kept in typed arrays.
 */
export type DeviceState = Float64Array;

export interface OutputParam {
  /** Element index. */
  readonly index: number;
  /** Output parameter name. */
  readonly name: string;
  /** Output parameter unit. */
  readonly unit: string;
}

export type EvalParams = {
  /** Elapsed simulation time. */
  readonly elapsedTime: number;
  /** Time step from the last simulation. */
  readonly timeStep: number;
  /** The default temperature of devices. */
  readonly temp: number;
  /** Voltage or current source value multiplier for the convergence helper. */
  readonly sourceFactor: number;
};

export abstract class Device {
  static readonly dummy = new (class Dummy extends Device {
    static override readonly id = "DUMMY";
    static override readonly numTerminals = 0;
    static override readonly stateSize = 0;
    static override readonly propertiesSchema = {};

    constructor() {
      super("DUMMY");
    }
  })();

  /** Unique device class identifier. */
  static readonly id: string;

  /** The number of terminals in the device. */
  static readonly numTerminals: number;

  /** Schema of the device state vector. */
  static readonly stateSize: number;

  /** Schema of the device parameters. */
  static readonly propertiesSchema: PropertiesSchema;

  /** Whether this device is linear. Most devices are linear. */
  static readonly linear: boolean = true;

  /** Unique device instance identifier. */
  readonly id: string;

  /** Device properties. */
  readonly properties: Properties;

  /** Probes to measure device output parameters. */
  readonly probes: readonly Probe[] = [];

  /** Vector with device state variables. */
  state: DeviceState;

  constructor(id: string) {
    this.id = id;
    const { stateSize, propertiesSchema } = this.deviceClass;
    this.properties = new Properties(propertiesSchema);
    this.state = new Float64Array(stateSize);
  }

  get deviceClass(): DeviceClass {
    return this.constructor as DeviceClass;
  }

  /**
   * Circuit calls this method to let a device allocate extra nodes and
   * branches.
   * @param network A network which contains allocated nodes and branches.
   * @param nodes Circuit nodes to which the device terminals are connected.
   */
  connect(network: Network, nodes: readonly Node[]): void {}

  deriveState(state: DeviceState, params: EvalParams): void {}

  beginEval(state: DeviceState, params: EvalParams): void {}

  eval(state: DeviceState, params: EvalParams, stamper: Stamper): void {}

  endEval(state: DeviceState, params: EvalParams): void {}
}
