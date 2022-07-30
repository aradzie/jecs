## Netlist

```text
V:DUT np gnd V=5
R:R1 np gnd R=1000
.dc
```

## Result

```text
V(np)=5V
DUT{V=5V,I=-5mA}
R1{V=5V,I=5mA}
```
