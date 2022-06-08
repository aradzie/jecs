## Netlist

```text
V nd gnd V=15
V ng gnd V=10
MOSFET:DUT gnd ng nd gnd @NMOS Is=0
.dc
```

## Result

```text
V(nd)=15V
V(ng)=10V
V1{V=15V,I=-640mA,P=-9.6W}
V2{V=10V,I=0A,P=0W}
DUT{Vgs=10V,Vgd=-5V,Vds=15V,Ids=640mA}
```

---

## Netlist

```text
V ns gnd V=15
V ng gnd V=10
MOSFET:DUT ns ng gnd ns @NMOS Is=0
.dc
```

## Result

```text
V(ns)=15V
V(ng)=10V
V1{V=15V,I=-640mA,P=-9.6W}
V2{V=10V,I=0A,P=0W}
DUT{Vgs=-5V,Vgd=10V,Vds=-15V,Ids=-640mA}
```

---

## Netlist

```text
V ns gnd V=0.7738435
MOSFET:DUT ns gnd gnd ns @NMOS
.dc
```

## Result

```text
V(ns)=773.844mV
V1{V=773.844mV,I=-100mA,P=-77.384mW}
DUT{Vgs=-773.844mV,Vgd=0V,Vds=-773.844mV,Ids=0A}
```

---

## Netlist

```text
V nd gnd V=0.7738435
MOSFET:DUT gnd nd nd gnd @PMOS
.dc
```

## Result

```text
V(nd)=773.844mV
V1{V=773.844mV,I=-100mA,P=-77.384mW}
DUT{Vgs=773.844mV,Vgd=0V,Vds=773.844mV,Ids=0A}
```
