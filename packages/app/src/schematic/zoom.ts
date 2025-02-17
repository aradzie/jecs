import { signal } from "@preact/signals";
import { type Area, round } from "../graphics/geometry.ts";

const defaultGridSize = 10;
const minGridSize = 4;
const maxGridSize = 30;

export class Zoom {
  static readonly defaultZoom = new Zoom();
  readonly #gridSize: number;
  readonly #x: number;
  readonly #y: number;
  readonly #scale: number;

  static snap(v: number) {
    return round(v / defaultGridSize) * defaultGridSize;
  }

  static floor(v: number): number {
    return Math.floor(v / defaultGridSize) * defaultGridSize;
  }

  static ceil(v: number): number {
    return Math.ceil(v / defaultGridSize) * defaultGridSize;
  }

  constructor(gridSize: number = defaultGridSize, x: number = 0, y: number = 0) {
    gridSize = round(gridSize);
    x = round(x);
    y = round(y);
    gridSize = Math.max(minGridSize, gridSize);
    gridSize = Math.min(maxGridSize, gridSize);
    this.#gridSize = gridSize;
    this.#x = x;
    this.#y = y;
    this.#scale = gridSize / defaultGridSize;
  }

  get gridSize(): number {
    return this.#gridSize;
  }

  get x(): number {
    return this.#x;
  }

  get y(): number {
    return this.#y;
  }

  get scale(): number {
    return this.#scale;
  }

  scaleTo(scale: number): Zoom {
    return new Zoom(defaultGridSize * scale, this.#x, this.#y);
  }

  scaleBy(deltaScale: number): Zoom {
    return new Zoom(defaultGridSize * (this.#scale + deltaScale), this.#x, this.#y);
  }

  zoomTo(gridSize: number): Zoom {
    return new Zoom(gridSize, this.#x, this.#y);
  }

  zoomBy(deltaGridSize: number): Zoom {
    return new Zoom(this.#gridSize + deltaGridSize, this.#x, this.#y);
  }

  moveTo(x: number, y: number): Zoom {
    return new Zoom(this.#gridSize, x, y);
  }

  moveBy(deltaX: number, deltaY: number): Zoom {
    return new Zoom(this.#gridSize, this.#x + deltaX, this.#y + deltaY);
  }

  /** Converts the given absolute screen coordinate to a grid relative coordinate. */
  toGridX(screenX: number): number {
    return round((screenX - this.#x) / this.#scale);
  }

  /** Converts the given absolute screen coordinate to a grid relative coordinate. */
  toGridY(screenY: number): number {
    return round((screenY - this.#y) / this.#scale);
  }

  /** Converts the given grid relative coordinate to an absolute screen coordinate. */
  toScreenX(gridX: number): number {
    return round(gridX * this.#scale + this.#x);
  }

  /** Converts the given grid relative coordinate to an absolute screen coordinate. */
  toScreenY(gridY: number): number {
    return round(gridY * this.#scale + this.#y);
  }

  /** Snaps the given absolute screen coordinate to the nearest screen grid point. */
  snapScreenX(screenX: number): number {
    return this.toScreenX(Zoom.snap(this.toGridX(screenX)));
  }

  /** Snaps the given absolute screen coordinate to the nearest screen grid point. */
  snapScreenY(screenY: number): number {
    return this.toScreenY(Zoom.snap(this.toGridY(screenY)));
  }

  /**
   * Places the given logical grid area in the center of the screen.
   * @param screenWidth Total screen width.
   * @param screenHeight Total screen height.
   * @param area Logical grid area to place in the center of the screen.
   * @param cover Whether to scale (grow or shrink) the grid area to cover the whole screen.
   */
  static center(
    screenWidth: number,
    screenHeight: number,
    area: Area,
    cover: boolean = false,
  ): Zoom {
    const width = area.x1 - area.x0;
    const height = area.y1 - area.y0;
    let zoom = Zoom.defaultZoom;
    if (cover && width > 0 && height > 0) {
      zoom = zoom.scaleTo(
        Math.min(
          screenWidth / (width + defaultGridSize * 2),
          screenHeight / (height + defaultGridSize * 2),
        ),
      );
    }
    return zoom.moveTo(
      screenWidth / 2 - (width / 2 + area.x0) * zoom.scale,
      screenHeight / 2 - (height / 2 + area.y0) * zoom.scale,
    );
  }
}

export const zoom = signal(new Zoom());
