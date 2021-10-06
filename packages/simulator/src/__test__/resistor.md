## Netlist

```json
[
  ["V", ["NP", "g"], { "v": 5 }],
  ["R:DUT", ["NP", "g"], { "r": 1000 }]
]
```

## Result

```text
V(NP)=5V
V1{Vd=5V,I=-5mA,P=-25mW}
DUT{Vd=5V,I=5mA,P=25mW}
```

---

## Netlist

```json
[
  ["V", ["NP", "g"], { "v": 5 }],
  ["R:DUT", ["NP", "g"], { "r": -1000 }]
]
```

## Result

```text
V(NP)=5V
V1{Vd=5V,I=5mA,P=25mW}
DUT{Vd=5V,I=-5mA,P=-25mW}
```
