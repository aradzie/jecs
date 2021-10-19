## Netlist

```text
Ground na;
V nb na v=5;
Ammeter:DUT nb nc;
R nc na r=1000;
```

## Result

```text
V(nb)=5V
V(nc)=5V
V1{Vd=5V,I=-5mA,P=-25mW}
DUT{I=5mA}
R1{Vd=5V,I=5mA,P=25mW}
```
