## Netlist

```json
[
  ["g", ["NA"], {}],
  ["v", ["NB", "NA"], { "v": 5 }],
  ["ammeter:DUT", ["NB", "NC"], {}],
  ["r", ["NC", "NA"], { "r": 1000 }]
]
```

## Result

```text
V(NB)=5V
V(NC)=5V
V1{Vd=5V,I=-5mA,P=-25mW}
DUT{I=5mA}
R1{Vd=5V,I=5mA,P=25mW}
```
