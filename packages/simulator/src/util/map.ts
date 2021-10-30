export class NameMap<T> implements Iterable<[string, T]> {
  private readonly map = new Map<string, T>();

  constructor(entries: Iterable<readonly [string, T]> | null = null) {
    if (entries != null) {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  get size(): number {
    return this.map.size;
  }

  [Symbol.iterator](): IterableIterator<[string, T]> {
    return this.map[Symbol.iterator]();
  }

  entries(): IterableIterator<[string, T]> {
    return this.map[Symbol.iterator]();
  }

  set(key: string, value: T): void {
    this.map.set(key.toLowerCase(), value);
  }

  has(key: string): boolean {
    return this.map.has(key.toLowerCase());
  }

  get(key: string): T | null {
    return this.map.get(key.toLowerCase()) ?? null;
  }
}
