## Netlist

```text
V:V1 ncp gnd V=5
VCVS:DUT nop gnd ncp gnd gain=2
R:R1 nop gnd R=10
.dc
```

## Result

```text
V(ncp)=5V
V(nop)=10V
V1{V=5V,I=0A,P=0W}
DUT{V=10V,I=-1A,P=-10W}
R1{V=10V,I=1A,P=10W}
```
