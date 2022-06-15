## Netlist

```text
V:VDS nd gnd V=5
V:VGS ng gnd V=0
JFET:DUT gnd ng nd @NFET
.dc
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
V:VDS nd gnd V=5
V:VGS ng gnd V=-5
JFET:DUT gnd ng nd @NFET
.dc
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
V:V1 gnd nc V=0.7
JFET:DUT nc gnd nc @NFET
.dc
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
V:V1 nc gnd V=0.7
JFET:DUT nc gnd nc @NFET
.dc
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
V:V1 nc gnd V=0.7
JFET:DUT nc gnd nc @PFET
.dc
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
V:V1 gnd nc V=0.7
JFET:DUT nc gnd nc @PFET
.dc
```

## Result

```text
V(nc)=-700mV
V1{V=700mV,I=0A,P=0W}
DUT{Vgs=700mV,Vgd=700mV,Vds=0V,Ids=0A}
```
