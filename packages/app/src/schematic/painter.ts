import { Area, Point, round } from "../graphics/geometry.ts";
import { Align, hAlignOf, vAlignOf } from "../symbol/align.ts";
import { getSymbolArea, Symbol } from "../symbol/symbol.ts";
import { Instance } from "./instance.ts";
import { Wire } from "./wire.ts";
import { Zoom } from "./zoom.ts";

const color = {
  symbol: {
    normal: "#222222",
    selected: "#0000ff",
  } as const,
  pin: {
    normal: "#222222",
    selected: "#0000ff",
  } as const,
  pinFill: {
    normal: "#ffffff",
    selected: "#ffffff",
  } as const,
  wire: {
    normal: "#222222",
    selected: "#0000ff",
  } as const,
  outline: "#22222222",
  selection: "#0000ff11",
  gridFine: "#00000066",
  gridCoarse: "#000000FF",
  crosshair: "#0000FF66",
} as const;

const d = 0.5;

export class Painter {
  readonly #canvas: HTMLCanvasElement;
  readonly #ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d")!;
  }

  get canvas(): HTMLCanvasElement {
    return this.#canvas;
  }

  get ctx(): CanvasRenderingContext2D {
    return this.#ctx;
  }

  get width(): number {
    return this.#canvas.width;
  }

  get height(): number {
    return this.#canvas.height;
  }

  reset() {
    this.#ctx.reset();
  }

  paintGrid(zoom: Zoom) {
    const zs = zoom.scale;
    const zx = zoom.x;
    const zy = zoom.y;
    const zg = zoom.gridSize;
    const cs = 10;
    const dxf = zx % zg;
    const dxc = zx % (zg * cs);
    const dyf = zy % zg;
    const dyc = zy % (zg * cs);
    this.#withCtx((ctx, width, height) => {
      if (zs >= 1) {
        // Paint fine grid.
        ctx.strokeStyle = color.gridFine;
        ctx.lineWidth = 1;
        ctx.lineCap = "butt";
        ctx.setLineDash([1, zg - 1]);
        for (let y = dyf; y < height; y += zg) {
          ctx.beginPath();
          ctx.moveTo(dxf, y + d);
          ctx.lineTo(width, y + d);
          ctx.stroke();
        }
      }
    });
    this.#withCtx((ctx, width, height) => {
      // Paint coarse grid.
      ctx.strokeStyle = zs >= 1 ? color.gridCoarse : color.gridFine;
      ctx.lineWidth = 1;
      ctx.lineCap = "butt";
      ctx.setLineDash([1, zg - 1]);
      // Paint horizontal coarse grid lines.
      for (let y = dyc; y < height; y += zg * cs) {
        ctx.beginPath();
        ctx.moveTo(dxf, y + d);
        ctx.lineTo(width, y + d);
        ctx.stroke();
      }
      // Paint vertical coarse grid lines.
      for (let x = dxc; x < width; x += zg * cs) {
        ctx.beginPath();
        ctx.moveTo(x + d, dyf);
        ctx.lineTo(x + d, height);
        ctx.stroke();
      }
    });
    this.#withCtx((ctx, width, height) => {
      // Paint a cross at the origin.
      ctx.strokeStyle = color.gridFine;
      ctx.lineWidth = 1;
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.moveTo(/* x */ round(zx - 10 * zs) + d, /* y */ round(zy) + d);
      ctx.lineTo(/* x */ round(zx + 10 * zs) + d, /* y */ round(zy) + d);
      ctx.moveTo(/* x */ round(zx) + d, /* y */ round(zy - 10 * zs) + d);
      ctx.lineTo(/* x */ round(zx) + d, /* y */ round(zy + 10 * zs) + d);
      ctx.stroke();
    });
  }

  paintCrosshair(zoom: Zoom, { x, y }: Point, selected: boolean) {
    this.#withCtx((ctx, width, height) => {
      if (selected) {
        ctx.strokeStyle = color.crosshair;
        ctx.lineWidth = 1;
        ctx.lineCap = "butt";
      } else {
        ctx.strokeStyle = color.outline;
        ctx.lineWidth = 1;
        ctx.lineCap = "butt";
      }
      ctx.beginPath();
      ctx.moveTo(0, zoom.snapScreenY(y) + d);
      ctx.lineTo(width, zoom.snapScreenY(y) + d);
      ctx.moveTo(zoom.snapScreenX(x) + d, 0);
      ctx.lineTo(zoom.snapScreenX(x) + d, height);
      ctx.stroke();
    });
  }

  paintSelection(zoom: Zoom, a: Point, b: Point) {
    this.#withCtx((ctx) => {
      ctx.fillStyle = color.selection;
      ctx.fillRect(round(a.x), round(a.y), round(b.x - a.x), round(b.y - a.y));
    });
  }

  paintInstance(zoom: Zoom, instance: Point & Pick<Symbol, "shapes">, selected: boolean = false) {
    const zs = zoom.scale;
    const zx = zoom.x;
    const zy = zoom.y;
    const cx = instance.x;
    const cy = instance.y;
    // Paint shapes.
    this.#withCtx((ctx) => {
      if (selected) {
        ctx.fillStyle = color.symbol.selected;
        ctx.strokeStyle = color.symbol.selected;
        ctx.lineWidth = 3;
        ctx.lineCap = "square";
      } else {
        ctx.fillStyle = color.symbol.normal;
        ctx.strokeStyle = color.symbol.normal;
        ctx.lineWidth = 1;
        ctx.lineCap = "square";
      }
      for (const shape of instance.shapes) {
        switch (shape[0]) {
          case "l": {
            // Paint a straight line.
            const [_, x0, y0, x1, y1] = shape;
            ctx.beginPath();
            ctx.moveTo(
              /* x */ round(zx + (cx + x0) * zs) + d,
              /* y */ round(zy + (cy + y0) * zs) + d,
            );
            ctx.lineTo(
              /* x */ round(zx + (cx + x1) * zs) + d,
              /* y */ round(zy + (cy + y1) * zs) + d,
            );
            ctx.stroke();
            break;
          }
          case "c": {
            // Paint a full circle.
            const [_, x, y, r] = shape;
            ctx.beginPath();
            ctx.ellipse(
              /* x */ round(zx + (cx + x) * zs) + d,
              /* y */ round(zy + (cy + y) * zs) + d,
              /* radius x */ round(r * zs),
              /* radius y */ round(r * zs),
              /* rotation */ 0,
              /* start angle */ 0,
              /* end angle */ 2 * Math.PI,
            );
            ctx.stroke();
            break;
          }
          case "a": {
            // Paint an arc.
            const [_, x, y, r, startAngle, endAngle] = shape;
            ctx.beginPath();
            ctx.ellipse(
              /* x */ round(zx + (cx + x) * zs) + d,
              /* y */ round(zy + (cy + y) * zs) + d,
              /* radius x */ round(r * zs),
              /* radius y */ round(r * zs),
              /* rotation */ 0,
              /* start angle */ startAngle * (Math.PI / 180),
              /* end angle */ endAngle * (Math.PI / 180),
            );
            ctx.stroke();
            break;
          }
          case "t": {
            // Paint a text label.
            const [_, x, y, align, text] = shape;
            this.#textStyle(ctx, zoom, align);
            ctx.fillText(text, /* x */ zx + (cx + x) * zs, /* y */ zy + (cy + y) * zs);
            break;
          }
        }
      }
    });
  }

  paintPins(zoom: Zoom, instance: Point & Pick<Symbol, "pins">, selected: boolean = false) {
    const zs = zoom.scale;
    const zx = zoom.x;
    const zy = zoom.y;
    const cx = instance.x;
    const cy = instance.y;
    // Paint pins.
    this.#withCtx((ctx) => {
      if (selected) {
        ctx.fillStyle = color.pinFill.selected;
        ctx.strokeStyle = color.pin.selected;
        ctx.lineWidth = 3;
        ctx.lineCap = "square";
      } else {
        ctx.fillStyle = color.pinFill.normal;
        ctx.strokeStyle = color.pin.normal;
        ctx.lineWidth = 1;
        ctx.lineCap = "square";
      }
      for (const pin of instance.pins) {
        const [_, x, y] = pin;
        ctx.beginPath();
        ctx.ellipse(
          /* x */ round(zx + (cx + x) * zs) + d,
          /* y */ round(zy + (cy + y) * zs) + d,
          /* radius x */ round(3 * zs),
          /* radius y */ round(3 * zs),
          /* rotation */ 0,
          /* start angle */ 0,
          /* end angle */ 2 * Math.PI,
        );
        ctx.fill();
        ctx.stroke();
      }
    });
  }

  paintLabels(zoom: Zoom, instance: Instance, selected: boolean = false) {
    const zs = zoom.scale;
    const zx = zoom.x;
    const zy = zoom.y;
    const cx = instance.x;
    const cy = instance.y;
    // Paint labels
    this.#withCtx((ctx) => {
      if (selected) {
        ctx.fillStyle = color.symbol.selected;
      } else {
        ctx.fillStyle = color.symbol.normal;
      }
      const [x, y, align] = instance.labels;
      this.#textStyle(ctx, zoom, align);
      ctx.fillText(instance.name, /* x */ zx + (cx + x) * zs, /* y */ zy + (cy + y) * zs);
    });
  }

  paintWire(zoom: Zoom, wire: Wire, selected: boolean = false) {
    const zs = zoom.scale;
    const zx = zoom.x;
    const zy = zoom.y;
    this.#withCtx((ctx) => {
      if (selected) {
        ctx.strokeStyle = color.wire.selected;
        ctx.lineWidth = 3;
        ctx.lineCap = "square";
      } else {
        ctx.strokeStyle = color.wire.normal;
        ctx.lineWidth = 1;
        ctx.lineCap = "square";
      }
      const { x0, y0, x1, y1 } = wire;
      ctx.beginPath();
      ctx.moveTo(/* x */ round(zx + x0 * zs) + d, /* y */ round(zy + y0 * zs) + d);
      ctx.lineTo(/* x*/ round(zx + x1 * zs) + d, /* y */ round(zy + y1 * zs) + d);
      ctx.stroke();
    });
  }

  paintJoins(zoom: Zoom, joins: readonly Point[]) {
    const zs = zoom.scale;
    const zx = zoom.x;
    const zy = zoom.y;
    this.#withCtx((ctx) => {
      ctx.fillStyle = color.wire.normal;
      for (const { x, y } of joins) {
        ctx.beginPath();
        ctx.ellipse(
          /* x */ round(zx + x * zs) + d,
          /* y */ round(zy + y * zs) + d,
          /* radius x */ round(3 * zs),
          /* radius y */ round(3 * zs),
          /* rotation */ 0,
          /* start angle */ 0,
          /* end angle */ 2 * Math.PI,
        );
        ctx.fill();
      }
    });
  }

  paintOrigin(zoom: Zoom, { x, y }: Point, selected: boolean) {
    const zs = zoom.scale;
    const zx = zoom.x;
    const zy = zoom.y;
    this.#withCtx((ctx) => {
      if (selected) {
        ctx.strokeStyle = color.symbol.selected;
        ctx.lineWidth = 1;
        ctx.lineCap = "butt";
      } else {
        ctx.strokeStyle = color.outline;
        ctx.lineWidth = 1;
        ctx.lineCap = "butt";
      }
      ctx.beginPath();
      ctx.moveTo(/* x */ round(zx + (x - 10) * zs) + d, /* y */ round(zy + y * zs) + d);
      ctx.lineTo(/* x */ round(zx + (x + 10) * zs) + d, /* y */ round(zy + y * zs) + d);
      ctx.moveTo(/* x */ round(zx + x * zs) + d, /* y */ round(zy + (y - 10) * zs) + d);
      ctx.lineTo(/* x */ round(zx + x * zs) + d, /* y */ round(zy + (y + 10) * zs) + d);
      ctx.stroke();
    });
  }

  paintArea(zoom: Zoom, { x0, y0, x1, y1 }: Area, selected: boolean) {
    const zs = zoom.scale;
    const zx = zoom.x;
    const zy = zoom.y;
    this.#withCtx((ctx) => {
      if (selected) {
        ctx.strokeStyle = color.symbol.selected;
        ctx.lineWidth = 1;
        ctx.lineCap = "square";
      } else {
        ctx.strokeStyle = color.outline;
        ctx.lineWidth = 1;
        ctx.lineCap = "square";
      }
      ctx.strokeRect(
        /* x */ round(zx + x0 * zs) + d,
        /* y */ round(zy + y0 * zs) + d,
        /* width */ round((x1 - x0) * zs),
        /* height */ round((y1 - y0) * zs),
      );
    });
  }

  paintSymbolIcon(symbol: Pick<Symbol, "shapes" | "pins">, width: number, height: number) {
    const area = getSymbolArea(symbol, 0, 0);
    const zoom = Zoom.center(width, height, area, true);
    this.paintInstance(zoom, { x: 0, y: 0, shapes: symbol.shapes });
  }

  #textStyle(ctx: CanvasRenderingContext2D, zoom: Zoom, align: Align) {
    ctx.font = `${20 * zoom.scale}px serif`;
    switch (hAlignOf(align)) {
      case "l":
        ctx.textAlign = "left";
        break;
      case "c":
        ctx.textAlign = "center";
        break;
      case "r":
        ctx.textAlign = "right";
        break;
    }
    switch (vAlignOf(align)) {
      case "t":
        ctx.textBaseline = "top";
        break;
      case "m":
        ctx.textBaseline = "middle";
        break;
      case "b":
        ctx.textBaseline = "bottom";
        break;
    }
  }

  #withCtx = (cb: (ctx: CanvasRenderingContext2D, width: number, height: number) => void) => {
    const ctx = this.#ctx;
    ctx.save();
    cb(ctx, this.#canvas.width, this.#canvas.height);
    ctx.restore();
  };
}
