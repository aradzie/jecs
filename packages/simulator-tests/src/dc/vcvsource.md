## Netlist

```text
Ground [NCN];
Ground [NON];
V [NCP NCN] v=5;
VCVS:DUT [NOP NON NCP NCN] gain=2;
R [NOP NON] r=10;
```

## Result

```text
V(NCP)=5V
V(NOP)=10V
V1{Vd=5V,I=0A,P=0W}
DUT{Vd=10V,I=-1A,P=-10W}
R1{Vd=10V,I=1A,P=10W}
```
