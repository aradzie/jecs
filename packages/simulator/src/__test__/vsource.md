## Netlist

```json
[
  ["g", ["NN"], {}],
  ["v:DUT", ["NP", "NN"], { "v": 5 }],
  ["r", ["NP", "NN"], { "r": 1000 }]
]
```

## Result

```text
V(NP)=5V
DUT{Vd=5V,I=-5mA,P=-25mW}
R1{Vd=5V,I=5mA,P=25mW}
```
