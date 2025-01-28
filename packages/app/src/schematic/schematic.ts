import type { Point } from "./graphics.ts";

export class Schematic {
  #crosshair: Point | null = null;
  #canvas!: HTMLCanvasElement;

  listen(window: Window) {
    window.addEventListener("keydown", this.#handleKeyDown);
  }

  attach(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    canvas.addEventListener("click", this.#handleClick);
    canvas.addEventListener("mousedown", this.#handleMouseDown);
    canvas.addEventListener("mouseup", this.#handleMouseUp);
    canvas.addEventListener("mousemove", this.#handleMouseMove);
    canvas.addEventListener("wheel", this.#handleWheel);
  }

  #handleKeyDown = (ev: KeyboardEvent) => {};

  #handleClick = (ev: MouseEvent) => {
    ev.preventDefault();
  };

  #handleMouseDown = (ev: MouseEvent) => {
    ev.preventDefault();
  };

  #handleMouseUp = (ev: MouseEvent) => {
    ev.preventDefault();
  };

  #handleMouseMove = (ev: MouseEvent) => {
    ev.preventDefault();
    const { width, height } = this.#canvas;
    const x = ev.offsetX;
    const y = ev.offsetY;
    if (x >= 0 && x < width && y >= 0 && y < height) {
      this.#crosshair = { x, y };
      this.paint();
    } else {
      this.#crosshair = null;
    }
  };

  #handleWheel = (ev: WheelEvent) => {
    ev.preventDefault();
  };

  paint() {
    const { width, height } = this.#canvas;
    const ctx = this.#canvas.getContext("2d")!;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgb(200 0 0)";
    ctx.fillRect(10, 10, 50, 50);
    ctx.fillStyle = "rgb(0 0 200 / 50%)";
    ctx.fillRect(30, 30, 50, 50);
    ctx.fillStyle = "rgb(0 0 0 / 50%)";
    const crosshair = this.#crosshair;
    if (crosshair != null) {
      ctx.fillRect(0, crosshair.y, width, 1);
      ctx.fillRect(crosshair.x, 0, 1, height);
    }
  }
}
