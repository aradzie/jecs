# Electronic Circuit Simulator

jssim is an electronic circuit simulator written in TypeScript.

## Example

```typescript
// Create an empty circuit.
const circuit = new Circuit();

// Allocate circuit nodes.
const ng = circuit.groundNode;
const n0 = circuit.allocNode("N0");

// Add devices to the circuit.
circuit.addDevice(
  new VSource("V1", [n0, ng], {
    v: 10,
  }),
  new Resistor("R1", [n0, ng], {
    r: 1000,
  }),
);

// Make DC analysis, compute node voltages and branch currents.
const r = circuit.dc();

// Check the result.
t.deepEqual(
  r,
  new Map([
    ["V[N0]", 10],
    ["I[N0->GROUND]", -0.01],
  ]),
);
```

## License

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 2 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 51 Franklin
Street, Fifth Floor, Boston, MA 02110-1301, USA.
