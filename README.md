# Electronic Circuit Simulator

jssim is an electronic circuit simulator written in TypeScript.

## Example

The following code

```typescript
// Create an empty circuit.
const circuit = new Circuit();

// Allocate circuit nodes.
const ng = circuit.groundNode;
const n1 = circuit.allocNode("N1");
const n2 = circuit.allocNode("N2");

// Add devices to the circuit.
circuit.addDevice(
  new VSource("V1", [n1, ng], {
    v: 10,
  }),
  new Resistor("R1", [n1, n2], {
    r: 1000,
  }),
  new Diode("D1", [n2, ng], {
    Temp: 26.85,
    Is: 1e-14,
    N: 1,
  }),
);

// Perform DC analysis, compute node voltages and branch currents.
dcAnalysis(circuit);

// Print the operating points.
console.log(dumpCircuit(circuit));
```

prints the following result

```typescript
[
  "V(N1)=10V", // voltage at node N1
  "V(N2)=712.41mV", // voltage at node N2
  "V1{Vd=10V,I=-9.288mA,P=-92.876mW}", // voltage source OP-s
  "R1{Vd=9.288V,I=9.288mA,P=86.259mW}", // resistor OP-s
  "D1{Vd=712.41mV,I=9.288mA,P=6.617mW}", // diode OP-s
];
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
