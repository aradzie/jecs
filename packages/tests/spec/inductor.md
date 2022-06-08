## Netlist

```text
V n1 g V=5
R n1 n2 R=5
L:DUT n2 g L=1e-3
.dc
```

## Result

```text
V(n1)=5V
V(n2)=0V
V1{V=5V,I=-1A,P=-5W}
R1{V=5V,I=1A,P=5W}
DUT{V=0V,I=1A,P=0W}
```
