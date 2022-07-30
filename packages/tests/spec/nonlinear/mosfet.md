## Netlist

```text
V:V1 nd gnd V=15
V:V2 ng gnd V=10
MOSFET:DUT gnd ng nd gnd @NMOS
.dc
```

## Result

```text
V(nd)=15V
V(ng)=10V
V1{V=15V,I=-640mA}
V2{V=10V,I=0A}
DUT{Vgs=10V,Vgd=-5V,Vds=15V,Ids=640mA}
```

---

## Netlist

```text
V:V1 ns gnd V=0.7
V:V2 ng gnd V=0.0
MOSFET:DUT ns ng gnd ns @NMOS
.dc
```

## Result

```text
V(ns)=700mV
V(ng)=0V
V1{V=700mV,I=-5.748mA}
V2{V=0V,I=0A}
DUT{Vgs=-700mV,Vgd=0V,Vds=-700mV,Ids=0A}
```

---

## Netlist

```text
V:V1 ns gnd V=0.7738435
MOSFET:DUT ns gnd gnd ns @NMOS
.dc
```

## Result

```text
V(ns)=773.844mV
V1{V=773.844mV,I=-100mA}
DUT{Vgs=-773.844mV,Vgd=0V,Vds=-773.844mV,Ids=0A}
```

---

## Netlist

```text
V:V1 nd gnd V=0.7738435
MOSFET:DUT gnd nd nd gnd @PMOS
.dc
```

## Result

```text
V(nd)=773.844mV
V1{V=773.844mV,I=-100mA}
DUT{Vgs=773.844mV,Vgd=0V,Vds=773.844mV,Ids=0A}
```
