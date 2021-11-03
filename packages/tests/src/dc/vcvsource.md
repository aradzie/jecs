## Netlist

```text
Ground ncn;
Ground non;
V ncp ncn V=5;
VCVS:DUT nop non ncp ncn gain=2;
R nop non R=10;
```

## Result

```text
V(ncp)=5V
V(nop)=10V
V1{V=5V,I=0A,P=0W}
DUT{V=10V,I=-1A,P=-10W}
R1{V=10V,I=1A,P=10W}
```
