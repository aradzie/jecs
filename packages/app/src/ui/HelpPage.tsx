import * as styles from "./HelpPage.module.css";

export function HelpPage() {
  return (
    <section class={styles.root}>
      <p>
        To draw a wire, click and start moving the pointer from a device pin, a wire end, or a wire
        junction. To draw a wire from any location on the grid, press <kbd>W</kbd>. To change a
        wire's angle, press <kbd>Shift</kbd>. To draw a diagonal wire, press <kbd>Alt</kbd>.
      </p>
      <p>Shortcuts:</p>
      <ul>
        <li>
          <kbd>W</kbd> Start drawing a wire from any point on the grid
        </li>
        <li>
          <kbd>Shift</kbd> While drawing a wire, changes the angle of the wire
        </li>
        <li>
          <kbd>Alt</kbd> While drawing a wire, draws a diagonal wire
        </li>
        <li>
          <kbd>G</kbd> Place a ground symbol
        </li>
        <li>
          <kbd>O</kbd> Place a port symbol
        </li>
        <li>
          <kbd>V</kbd> Place a voltage source
        </li>
        <li>
          <kbd>I</kbd> Place a current source
        </li>
        <li>
          <kbd>R</kbd> Place a resistor
        </li>
        <li>
          <kbd>C</kbd> Place a capacitor
        </li>
        <li>
          <kbd>L</kbd> Place an inductor
        </li>
        <li>
          <kbd>D</kbd> Place a diode
        </li>
        <li>
          <kbd>N</kbd> Place an NPN transistor
        </li>
        <li>
          <kbd>P</kbd> Place a PNP transistor
        </li>
        <li>
          <kbd>Shift+N</kbd> Place an N-channel MOSFET
        </li>
        <li>
          <kbd>Shift+P</kbd> Place a P-channel MOSFET
        </li>
        <li>
          <kbd>A</kbd> Place an operational amplifier
        </li>
        <li>
          <kbd>Home</kbd> Zoom to 100%
        </li>
        <li>
          <kbd>Space</kbd> Expand or shrink to cover the whole screen
        </li>
        <li>
          <kbd>Ctrl+X</kbd> Cut selected item(s) to clipboard
        </li>
        <li>
          <kbd>Ctrl+C</kbd> Copy selected item(s) to clipboard
        </li>
        <li>
          <kbd>Ctrl+V</kbd> Paste item(s) from clipboard
        </li>
        <li>
          <kbd>Ctrl+A</kbd> Select all
        </li>
        <li>
          <kbd>Delete</kbd> Delete selected item(s)
        </li>
        <li>
          <kbd>Alt+L</kbd> Rotate selected item(s) to the left
        </li>
        <li>
          <kbd>Alt+R</kbd> Rotate selected item(s) to the right
        </li>
        <li>
          <kbd>Alt+H</kbd> Flip selected item(s) from left to right
        </li>
        <li>
          <kbd>Alt+V</kbd> Flip selected item(s) from top to bottom
        </li>
        <li>
          <kbd>Ctrl+Z</kbd> Undo
        </li>
        <li>
          <kbd>Ctrl+Y</kbd> Redo
        </li>
      </ul>
    </section>
  );
}
