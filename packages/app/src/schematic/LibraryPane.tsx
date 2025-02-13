import { useEffect, useRef } from "preact/hooks";
import { Canvas, resizeCanvas } from "../graphics/Canvas.tsx";
import { Symbol } from "../symbol/symbol.ts";
import { useController } from "./controller.ts";
import * as styles from "./LibraryPane.module.css";
import { Painter } from "./painter.ts";

export function LibraryPane() {
  const { library } = useController();
  const categories = Object.groupBy(library, ({ category }) => category);
  return (
    <div class={styles.root}>
      {Object.entries(categories).map(([name, symbols]) => (
        <Category key={name} name={name} symbols={symbols} />
      ))}
    </div>
  );
}

function Category({ name, symbols }: { name: string; symbols: Symbol[] }) {
  return (
    <div class={styles.category}>
      <div class={styles.title}>{name}</div>
      <div class={styles.list}>
        {symbols.map((symbol) => (
          <SymbolIcon key={symbol.id} symbol={symbol} />
        ))}
      </div>
    </div>
  );
}

function SymbolIcon({ symbol }: { symbol: Symbol }) {
  const controller = useController();
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const { width, height } = resizeCanvas(canvas.current!);
    const painter = new Painter(canvas.current!);
    painter.paintSymbolIcon(symbol, width, height);
  }, [symbol]);
  return (
    <div
      class={styles.symbol}
      title={symbol.name}
      onClick={() => {
        controller.pasteInstance(symbol);
      }}
    >
      <Canvas canvas={canvas} />
    </div>
  );
}
