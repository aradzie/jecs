export const { round } = Math;

export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Rect = Point & Size;
export type Area = { x0: number; y0: number; x1: number; y1: number };

export const getScreenSize = (): Size => {
  return { width: window.innerWidth, height: window.innerHeight };
};

export const getElementSize = (el: Element): Size => {
  return { width: el.clientWidth, height: el.clientHeight };
};

export const px = (length: string | number): string => {
  return typeof length === "number" ? `${length}px` : length;
};

/**
 * Tests whether area `a` partially overlaps with `b`.
 */
export const areaOverlaps = (a: Area, b: Area): boolean => {
  return (
    (a.x0 <= b.x0 && b.x0 <= a.x1 && a.y0 <= b.y0 && b.y0 <= a.y1) ||
    (a.x0 <= b.x0 && b.x0 <= a.x1 && a.y0 <= b.y1 && b.y1 <= a.y1) ||
    (a.x0 <= b.x1 && b.x1 <= a.x1 && a.y0 <= b.y0 && b.y0 <= a.y1) ||
    (a.x0 <= b.x1 && b.x1 <= a.x1 && a.y0 <= b.y1 && b.y1 <= a.y1)
  );
};

/**
 * Tests whether area `a` fully contains `b`.
 */
export const areaContains = (a: Area, b: Area): boolean => {
  return (
    a.x0 <= b.x0 &&
    b.x0 <= a.x1 &&
    a.x0 <= b.x1 &&
    b.x1 <= a.x1 &&
    a.y0 <= b.y0 &&
    b.y0 <= a.y1 &&
    a.y0 <= b.y1 &&
    b.y1 <= a.y1
  );
};
