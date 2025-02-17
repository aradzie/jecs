import { type RefObject } from "preact";
import { useEffect, useState } from "preact/hooks";

export function useElementSize(ref: RefObject<HTMLElement>) {
  const [rect, setRect] = useState(new DOMRect());
  useEffect(() => {
    const { current } = ref;
    if (current == null) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setRect(current.getBoundingClientRect());
    });
    observer.observe(current);
    return () => {
      observer.disconnect();
    };
  }, [ref]);
  return rect;
}
