import { Props as State, type PropValue } from "@jecs/simulator";
import { type Symbol } from "../symbol/symbol.ts";
import { unusable } from "./unusable.ts";

export class Props {
  static create({ device }: Symbol): Props {
    const props = new Props();
    props.#state = new State(device?.propsSchema ?? {});
    return props;
  }

  #state: State = unusable;

  private constructor() {}

  setValue(name: string, value: PropValue): Props {
    this.#state.set(name, value);
    return this.#transfer();
  }

  import(serial: SerialProps): Props {
    return this.#transfer();
  }

  export(): SerialProps {
    return {};
  }

  #transfer() {
    const that = new Props();
    that.#state = this.#state;
    this.#state = unusable;
    return that;
  }
}

export type SerialProps = Record<string, PropValue>;
