import { humanizeNumber } from "@jecs/simulator/lib/util/format";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import type { Result } from "../simul/types.js";
import styles from "./ResultPane.css";

export function ResultPane({ result }: { result: Result }): ReactElement {
  switch (result.type) {
    case "ok":
      return (
        <div className={clsx(styles.Result, styles.Result__ok)}>
          <table className={styles.OpTable}>
            <tbody>
              {result.ops.map(({ deviceId, name, value, unit }, index) => (
                <tr className={styles.OpTable_row} key={index}>
                  <td className={styles.OpTable__deviceId}>{deviceId}</td>
                  <td className={styles.OpTable__name}>{name}</td>
                  <td className={styles.OpTable__value}>{humanizeNumber(value, unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "error":
      return (
        <div className={clsx(styles.Result, styles.Result__error)}>
          <div className={styles.ErrorMessage}>
            {result.error.name}: {result.error.message || "Empty error message"}
          </div>
        </div>
      );
  }
}
