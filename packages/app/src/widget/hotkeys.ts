import { isInput } from "./form.ts";

export const Modifiers = {
  None: 0x0000,
  Shift: 0x0001,
  Alt: 0x0002,
  Control: 0x0004,
  Meta: 0x0008,
  of: (event: KeyboardEvent | MouseEvent | WheelEvent): number => {
    let mod = Modifiers.None;
    if (event.shiftKey) {
      mod |= Modifiers.Shift;
    }
    if (event.altKey) {
      mod |= Modifiers.Alt;
    }
    if (event.ctrlKey) {
      mod |= Modifiers.Control;
    }
    if (event.metaKey) {
      mod |= Modifiers.Meta;
    }
    return mod;
  },
} as const;

export type Hotkey = { key: string | "any"; mod: number; handler: Action };
export type Action = (ev: KeyboardEvent, mod: number) => boolean | undefined | void;
export type HotkeyHandler = (ev: KeyboardEvent) => boolean;

export function hotkeys(...items: [spec: string, handler: Action][]): HotkeyHandler {
  const hotkeys = items.map(parseHotkey);
  return (ev: KeyboardEvent): boolean => {
    if (isInput(ev.target)) {
      return true;
    }
    const mod = Modifiers.of(ev);
    for (const hotkey of hotkeys) {
      if (
        (hotkey.key === "any" || hotkey.key === ev.key || hotkey.key === ev.code) &&
        hotkey.mod === mod
      ) {
        if (hotkey.handler(ev, mod) !== false) {
          ev.preventDefault();
          return true;
        }
      }
    }
    return false;
  };
}

function parseHotkey([spec, handler]: [string, Action]): Hotkey {
  let key = "";
  let mod = Modifiers.None;
  const items = spec.split("+");
  while (items.length > 0) {
    const item = items.shift()!;
    switch (item) {
      case "Shift":
        mod |= Modifiers.Shift;
        break;
      case "Alt":
        mod |= Modifiers.Alt;
        break;
      case "Ctrl":
        mod |= Modifiers.Control;
        break;
      case "Meta":
        mod |= Modifiers.Meta;
        break;
      default:
        key = item;
        break;
    }
  }
  return { key, mod, handler };
}
