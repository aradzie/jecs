import { Element } from "./element.ts";
import { filterFormulas, filterInstances, filterWires } from "./filter.ts";
import { Formula } from "./formula.ts";
import { Instance } from "./instance.ts";
import { Names } from "./names.ts";
import { connect, dummyNetwork, Network } from "./network.ts";
import { Selection } from "./selection.ts";
import { rewire, Wire } from "./wire.ts";

type Wiring = {
  rewire(elements: Element[]): void;
  connect(elements: Iterable<Element>): Network;
};

const dummyWiring: Wiring = {
  rewire(elements: Element[]): void {},
  connect(elements: Iterable<Element>): Network {
    return dummyNetwork();
  },
};

const liveWiring: Wiring = {
  rewire(elements: Element[]): void {
    rewire(elements);
  },
  connect(elements: Iterable<Element>): Network {
    return connect(elements);
  },
};

export class Schematic implements Iterable<Element> {
  #elements: Element[];
  #wiring: Wiring;
  #instances: readonly Instance[] | null;
  #formulas: readonly Formula[] | null;
  #wires: readonly Wire[] | null;
  #network: Network | null;
  #names: Names | null;

  constructor(elements: Iterable<Element>, wiring: Wiring = liveWiring) {
    this.#elements = [...elements];
    this.#wiring = wiring;
    this.#instances = null;
    this.#formulas = null;
    this.#wires = null;
    this.#network = null;
    this.#names = null;
    this.#wiring.rewire(this.#elements);
    if (elements instanceof Schematic) {
      elements.#dispose();
    }
  }

  [Symbol.iterator](): IterableIterator<Element> {
    return this.#elements[Symbol.iterator]();
  }

  get instances(): readonly Instance[] {
    return (this.#instances ??= filterInstances(this.#elements));
  }

  get formulas(): readonly Formula[] {
    return (this.#formulas ??= filterFormulas(this.#elements));
  }

  get wires(): readonly Wire[] {
    return (this.#wires ??= filterWires(this.#elements));
  }

  get network(): Network {
    return (this.#network ??= this.#wiring.connect(this.#elements));
  }

  get names(): Names {
    return (this.#names ??= new Names(this.#elements));
  }

  append(elements: Iterable<Element>): Schematic {
    return new Schematic([...this.#elements, ...elements], this.#wiring);
  }

  delete(selection: Selection): Schematic {
    return new Schematic(
      this.#elements.filter((elem) => !selection.has(elem)),
      this.#wiring,
    );
  }

  unwire(): Schematic {
    return new Schematic(this.#elements, dummyWiring);
  }

  rewire(): Schematic {
    return new Schematic(this.#elements, liveWiring);
  }

  rename(order: "none" | "horizontal" | "vertical" = "none"): Schematic {
    const schematic = new Schematic(this.#elements, this.#wiring);
    schematic.names.rename(order);
    return schematic;
  }

  #dispose() {
    this.#elements = [];
    this.#wiring = dummyWiring;
    this.#instances = null;
    this.#formulas = null;
    this.#wires = null;
    this.#network = null;
    this.#names = null;
  }
}
