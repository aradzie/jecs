import { Element } from "./element.ts";
import { Instance } from "./instance.ts";

type Group = {
  instances: Instance[];
  names: Set<string>;
};

export class Names {
  static anonymous(prefix: string): string {
    return `${prefix}?`;
  }

  readonly #map = new Map<string, Group>();

  constructor(elements: Iterable<Element>) {
    for (const element of elements) {
      if (element instanceof Instance) {
        const group = this.#getGroup(element.symbol.prefix);
        group.instances.push(element);
        group.names.add(element.name);
      }
    }
  }

  getUniqueName(prefix: string): string {
    const group = this.#getGroup(prefix);
    let count = 1;
    while (true) {
      const name = `${prefix}${count}`;
      if (!group.names.has(name)) {
        group.names.add(name);
        return name;
      }
      count += 1;
    }
  }

  rename(order: "none" | "horizontal" | "vertical" = "none"): void {
    for (const [symbol, group] of this.#map.entries()) {
      switch (order) {
        case "none":
          break;
        case "horizontal":
          group.instances.sort((a, b) => a.x - b.x || a.y - b.y);
          break;
        case "vertical":
          group.instances.sort((a, b) => a.y - b.y || a.x - b.x);
          break;
      }
      group.names.clear();
      for (const instance of group.instances) {
        instance.name = this.getUniqueName(symbol);
      }
    }
  }

  #getGroup(prefix: string): Group {
    let group = this.#map.get(prefix);
    if (group == null) {
      this.#map.set(prefix, (group = { instances: [], names: new Set() }));
    }
    return group;
  }
}
