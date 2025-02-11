const inputTags = ["input", "textarea", "select", "INPUT", "TEXTAREA", "SELECT"];

export function isInput(target: unknown): target is Element & {
  focus: () => void;
  blur: () => void;
} {
  return target instanceof Element && inputTags.includes(target.tagName);
}

export function blurActiveInput() {
  const { activeElement } = document;
  if (isInput(activeElement)) {
    activeElement.blur();
  }
}
