## Netlist

```text
Ground g;
V:VDS nd g V=5;
V:VGS ng g V=0;
JFET:DUT g ng nd @nfet;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(nd)=5V
V(ng)=0V
VDS{Vd=5V,I=-400μA,P=-2mW}
VGS{Vd=0V,I=0A,P=0W}
DUT{Vgs=0V,Vds=5V,Ids=400μA}
```

---

## Netlist

```text
Ground g;
V:VDS nd g V=5;
V:VGS ng g V=-5;
JFET:DUT g ng nd @nfet;
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
DUT{Vgs=-5V,Vds=5V,Ids=0A}
```

---

## Netlist

```text
Ground g;
V g nc V=0.7;
JFET nc g nc @nfet;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(nc)=-700mV
V1{Vd=700mV,I=-11.495mA,P=-8.047mW}
JFET1{Vgs=700mV,Vds=0V,Ids=0A}
```

---

## Netlist

```text
Ground g;
V nc g V=0.7;
JFET nc g nc @nfet;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(nc)=700mV
V1{Vd=700mV,I=0A,P=0W}
JFET1{Vgs=-700mV,Vds=0V,Ids=0A}
```

---

## Netlist

```text
Ground g;
V nc g V=0.7;
JFET nc g nc @pfet;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(nc)=700mV
V1{Vd=700mV,I=-11.495mA,P=-8.047mW}
JFET1{Vgs=-700mV,Vds=0V,Ids=0A}
```

---

## Netlist

```text
Ground g;
V g nc V=0.7;
JFET nc g nc @pfet;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(nc)=-700mV
V1{Vd=700mV,I=0A,P=0W}
JFET1{Vgs=700mV,Vds=0V,Ids=0A}
```
