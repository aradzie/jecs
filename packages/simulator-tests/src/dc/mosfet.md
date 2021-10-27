## Netlist

```text
Ground g;
V nd g V=15;
V ng g V=10;
MOSFET:DUT g ng nd polarity="nfet";
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(nd)=15V
V(ng)=10V
V1{Vd=15V,I=-640mA,P=-9.6W}
V2{Vd=10V,I=0A,P=0W}
DUT{Vgs=10V,Vds=15V,Ids=640mA}
```

---

## Netlist

```text
Ground g;
V ns g V=15;
V ng g V=10;
MOSFET:DUT ns ng g polarity="nfet";
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(ns)=15V
V(ng)=10V
V1{Vd=15V,I=-640mA,P=-9.6W}
V2{Vd=10V,I=0A,P=0W}
DUT{Vgs=-5V,Vds=-15V,Ids=-640mA}
```
