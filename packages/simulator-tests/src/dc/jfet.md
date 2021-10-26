## Netlist

```text
Ground g;
V:VDS nd g V=5;
V:VGS ng g V=0;
JFET:DUT nd ng g polarity="nfet" Vth=-4;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(nd)=5V
V(ng)=0V
VDS{Vd=5V,I=-20mA,P=-100mW}
VGS{Vd=0V,I=0A,P=0W}
DUT{Vds=5V,Vgs=0V,Ids=20mA}
```

---

## Netlist

```text
Ground g;
V:VDS nd g V=5;
V:VGS ng g V=-5;
JFET:DUT nd ng g polarity="nfet" Vth=-4;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(nd)=5V
V(ng)=-5V
VDS{Vd=5V,I=0A,P=0W}
VGS{Vd=-5V,I=0A,P=0W}
DUT{Vds=5V,Vgs=-5V,Ids=0A}
```
