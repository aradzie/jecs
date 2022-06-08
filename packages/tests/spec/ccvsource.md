## Netlist

```text
I ncp gnd I=-1
CCVS:DUT nop gnd ncp gnd gain=10
R nop gnd R=10
.dc
```

## Result

```text
V(ncp)=0V
V(nop)=10V
I1{I=-1A,V=0V,P=0W}
DUT{V=10V,I=-1A,P=-10W}
R1{V=10V,I=1A,P=10W}
```
