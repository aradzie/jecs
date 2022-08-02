import type { ReactElement } from "react";
import { useState } from "react";
import defaultNetlist from "../assets/netlist.txt";
import { exec } from "../simul/exec";
import type { Result } from "../simul/types";
import styles from "./App.css";
import { NetlistEditor } from "./NetlistEditor";
import { ResultPane } from "./ResultPane";

export function App(): ReactElement {
  const [netlist, setNetlist] = useState<string>(defaultNetlist);
  const [result, setResult] = useState<Result>({ type: "ok", ops: [] });
  return (
    <main className={styles.App}>
      <section className={styles.App__editor}>
        <NetlistEditor
          value={netlist}
          onValueChange={(value: string): void => {
            setNetlist(value);
            exec(value).then(
              (result) => {
                setResult(result);
              },
              (error) => {
                setResult({ type: "error", error });
              },
            );
          }}
        />
      </section>
      <section className={styles.App__result}>
        <ResultPane result={result} />
      </section>
    </main>
  );
}
