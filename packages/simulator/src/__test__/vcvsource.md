## Netlist

```json
[
  ["g", ["NCN"], {}],
  ["g", ["NON"], {}],
  ["v", ["NCP", "NCN"], { "v": 5 }],
  ["vcvs:DUT", ["NOP", "NON", "NCP", "NCN"], { "gain": 2 }],
  ["r", ["NOP", "NON"], { "r": 10 }]
]
```

## Result

```text
V(NCP)=5V
V(NOP)=10V
V1{Vd=5V,I=0A,P=0W}
DUT{Vd=10V,I=-1A,P=-10W}
R1{Vd=10V,I=1A,P=10W}
```
