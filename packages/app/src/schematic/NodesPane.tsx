import { useController } from "./controller.ts";
import * as styles from "./NodesPane.module.css";

export function NodesPane() {
  const controller = useController();
  const { schematic } = controller;
  return (
    <ul class={styles.root}>
      {schematic.network.nodes.map((node) => (
        <li
          key={node.name}
          class={styles.item}
          onClick={() => {
            controller.select(node.elements);
            controller.focus();
          }}
        >
          {node.name}
        </li>
      ))}
    </ul>
  );
}
