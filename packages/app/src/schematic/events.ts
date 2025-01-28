export const MOD_SHIFT = 0x0001;
export const MOD_ALT = 0x0010;
export const MOD_CTRL = 0x0100;
export const MOD_META = 0x1000;

export const getModifiers = (event: KeyboardEvent | MouseEvent | WheelEvent) => {
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
};
