## Netlist

```text
Ground g;
V:VDS nd g V=5;
V:VGS ng g V=0;
JFET:DUT g ng nd @NFET;
.options reltol=1e-5;
```

## Result

```text
V(nd)=5V
V(ng)=0V
VDS{V=5V,I=-400μA,P=-2mW}
VGS{V=0V,I=0A,P=0W}
DUT{Vgs=0V,Vgd=-5V,Vds=5V,Ids=400μA}
```

---

## Netlist

```text
Ground g;
V:VDS nd g V=5;
V:VGS ng g V=-5;
JFET:DUT g ng nd @NFET;
.options reltol=1e-5;
```

## Result

```text
V(nd)=5V
V(ng)=-5V
VDS{V=5V,I=0A,P=0W}
VGS{V=-5V,I=0A,P=0W}
DUT{Vgs=-5V,Vgd=-10V,Vds=5V,Ids=0A}
```

---

## Netlist

```text
Ground g;
V g nc V=0.7;
JFET:DUT nc g nc @NFET;
.options reltol=1e-5;
```

## Result

```text
V(nc)=-700mV
V1{V=700mV,I=-11.495mA,P=-8.047mW}
DUT{Vgs=700mV,Vgd=700mV,Vds=0V,Ids=0A}
```

---

## Netlist

```text
Ground g;
V nc g V=0.7;
JFET:DUT nc g nc @NFET;
.options reltol=1e-5;
```

## Result

```text
V(nc)=700mV
V1{V=700mV,I=0A,P=0W}
DUT{Vgs=-700mV,Vgd=-700mV,Vds=0V,Ids=0A}
```

---

## Netlist

```text
Ground g;
V nc g V=0.7;
JFET:DUT nc g nc @PFET;
.options reltol=1e-5;
```

## Result

```text
V(nc)=700mV
V1{V=700mV,I=-11.495mA,P=-8.047mW}
DUT{Vgs=-700mV,Vgd=-700mV,Vds=0V,Ids=0A}
```

---

## Netlist

```text
Ground g;
V g nc V=0.7;
JFET:DUT nc g nc @PFET;
.options reltol=1e-5;
```

## Result

```text
V(nc)=-700mV
V1{V=700mV,I=0A,P=0W}
DUT{Vgs=700mV,Vgd=700mV,Vds=0V,Ids=0A}
```
