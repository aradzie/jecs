import { Point } from "../graphics/geometry.ts";

export const MOD_NONE = 0x0000;
export const MOD_SHIFT = 0x0001;
export const MOD_ALT = 0x0010;
export const MOD_CTRL = 0x0100;
export const MOD_META = 0x1000;

export type Hotkey = { key: string; mod: number; handler: Action };
export type Action = (ev: KeyboardEvent, mod: number) => boolean | undefined | void;
export type HotkeyHandler = (ev: KeyboardEvent) => boolean;

const formTags = ["input", "textarea", "select", "INPUT", "TEXTAREA", "SELECT"];

export function hotkeys(...items: [spec: string, handler: Action][]): HotkeyHandler {
  const hotkeys = items.map(parseHotkey);
  return (ev: KeyboardEvent): boolean => {
    const { target } = ev;
    if (target instanceof Element && formTags.includes(target.tagName)) {
      return true;
    }
    const mod = getModifiers(ev);
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

export function getModifiers(event: KeyboardEvent | MouseEvent | WheelEvent) {
  let mod = 0x0000;
  if (event.shiftKey) {
    mod |= MOD_SHIFT;
  }
  if (event.altKey) {
    mod |= MOD_ALT;
  }
  if (event.ctrlKey) {
    mod |= MOD_CTRL;
  }
  if (event.metaKey) {
    mod |= MOD_META;
  }
  return mod;
}

function parseHotkey([spec, handler]: [string, Action]): Hotkey {
  let key = "";
  let mod = MOD_NONE;
  const items = spec.split("+");
  while (items.length > 0) {
    const item = items.shift()!;
    switch (item) {
      case "Shift":
        mod |= MOD_SHIFT;
        break;
      case "Alt":
        mod |= MOD_ALT;
        break;
      case "Ctrl":
        mod |= MOD_CTRL;
        break;
      case "Meta":
        mod |= MOD_META;
        break;
      default:
        key = item;
        break;
    }
  }
  return { key, mod, handler };
}

export function pointerPosition(ev: { offsetX: number; offsetY: number }): Point {
  return { x: ev.offsetX, y: ev.offsetY };
}
