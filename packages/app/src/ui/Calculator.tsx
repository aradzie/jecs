import { useState } from "preact/hooks";
import * as styles from "./Calculator.module.css";
import { calculators } from "./calculator/index.ts";

export function Calculator() {
  const [calculator, setCalculator] = useState(calculators[0]);
  const { component: Calculator } = calculator;
  return (
    <section class={styles.root}>
      <select
        class={styles.select}
        value={calculator.name}
        onInput={({ target }) => {
          const { value } = target as HTMLSelectElement;
          setCalculator(calculators.find(({ name }) => name === value) ?? calculators[0]);
        }}
      >
        {calculators.map(({ name }) => (
          <option value={name}>{name}</option>
        ))}
      </select>
      <div class={styles.content}>
        <Calculator />
      </div>
    </section>
  );
}
