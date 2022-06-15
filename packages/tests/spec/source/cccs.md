## Netlist

```text
I:I1 ncp gnd I=1
CCCS:DUT nop gnd ncp gnd gain=2
R:R1 nop gnd R=5
.dc
```

## Result

```text
V(ncp)=0V
V(nop)=10V
I1{I=1A,V=0V,P=0W}
DUT{I=-2A,V=10V,P=-20W}
R1{V=10V,I=2A,P=20W}
```
