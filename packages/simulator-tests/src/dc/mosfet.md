## Netlist

```text
Ground g;
V nd g V=15;
V ng g V=10;
MOSFET:DUT g ng nd g @nmos Is=0;
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
DUT{Vgs=10V,Vgd=-5V,Vds=15V,Ids=640mA}
```

---

## Netlist

```text
Ground g;
V ns g V=15;
V ng g V=10;
MOSFET:DUT ns ng g ns @nmos Is=0;
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
DUT{Vgs=-5V,Vgd=10V,Vds=-15V,Ids=-640mA}
```

---

## Netlist

```text
Ground g;
V ns g V=0.7738435;
MOSFET:DUT ns g g ns @nmos;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(ns)=773.844mV
V1{Vd=773.844mV,I=-100mA,P=-77.384mW}
DUT{Vgs=-773.844mV,Vgd=0V,Vds=-773.844mV,Ids=0A}
```

---

## Netlist

```text
Ground g;
V nd g V=0.7738435;
MOSFET:DUT g nd nd g @pmos;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(nd)=773.844mV
V1{Vd=773.844mV,I=-100mA,P=-77.384mW}
DUT{Vgs=773.844mV,Vgd=0V,Vds=773.844mV,Ids=0A}
```
