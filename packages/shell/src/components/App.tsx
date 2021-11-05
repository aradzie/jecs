import type { ReactElement } from "react";
import { useState } from "react";
import defaultNetlist from "../assets/netlist.txt";
import { exec, Result } from "../simul/exec";
import styles from "./App.css";
import { NetlistEditor } from "./NetlistEditor";
import { ResultPane } from "./ResultPane";

export function App(): ReactElement {
  const [netlist, setNetlist] = useState<string>(defaultNetlist);
  const [result, setResult] = useState<Result>(exec(defaultNetlist));
  return (
    <main className={styles.App}>
      <section className={styles.App__editor}>
        <NetlistEditor
          value={netlist}
          onValueChange={(value: string): void => {
            setNetlist(value);
            setResult(exec(value));
          }}
        />
      </section>
      <section className={styles.App__result}>
        <ResultPane result={result} />
      </section>
    </main>
  );
}
