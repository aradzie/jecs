## Netlist

```text
V:V1 ncp gnd V=1
VCCS:DUT nop gnd ncp gnd gain=2
R:R1 nop gnd R=10
.dc
```

## Result

```text
V(ncp)=1V
V(nop)=-20V
V1{V=1V,I=0A}
DUT{I=2A,V=-20V}
R1{V=-20V,I=-2A}
```
