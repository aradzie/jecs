export type Id = number;

let id = 0;

export function nextId(): Id {
  return (id += 1);
}

export class Unique {
  readonly #id = nextId();

  get id(): Id {
    return this.#id;
  }
}
