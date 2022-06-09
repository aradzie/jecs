## Netlist

```text
V:V1 n1 gnd V=5
Ammeter:DUT n1 n2
R:R1 n2 gnd R=1000
.dc
```

## Result

```text
V(n1)=5V
V(n2)=5V
V1{V=5V,I=-5mA,P=-25mW}
DUT{I=5mA}
R1{V=5V,I=5mA,P=25mW}
```
