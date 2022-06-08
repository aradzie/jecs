## Netlist

```text
V:DUT np gnd V=5
R np gnd R=1000
.dc
```

## Result

```text
V(np)=5V
DUT{V=5V,I=-5mA,P=-25mW}
R1{V=5V,I=5mA,P=25mW}
```
