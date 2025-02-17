## Netlist

```text
V:V1 n1 gnd V=5
R:R1 n1 n2 R=5
L:DUT n2 gnd L=1e-3
.dc
```

## Result

```text
V(n1)=5V
V(n2)=0V
V1{V=5V,I=-1A}
R1{V=5V,I=1A}
DUT{V=0V,I=1A}
```
