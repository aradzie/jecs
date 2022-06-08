## Netlist

```text
Ground na
V nb na V=5
Ammeter:DUT nb nc
R nc na R=1000
.dc
```

## Result

```text
V(nb)=5V
V(nc)=5V
V1{V=5V,I=-5mA,P=-25mW}
DUT{I=5mA}
R1{V=5V,I=5mA,P=25mW}
```
