## Netlist

```text
V nc gnd V=5
V nb gnd V=0.65
BJT:DUT gnd nb nc @NPN
.dc
```

## Result

```text
V(nc)=5V
V(nb)=650mV
V1{V=5V,I=-822.618μA,P=-4.113mW}
V2{V=650mV,I=-8.226μA,P=-5.347μW}
DUT{Vbe=650mV,Vbc=-4.35V,Vce=5V,Ie=-830.844μA,Ic=822.618μA,Ib=8.226μA}
```

---

## Netlist

```text
V nc gnd V=5
I gnd nb I=0.0001
BJT:DUT gnd nb nc @NPN
.dc
```

## Result

```text
V(nc)=5V
V(nb)=714.575mV
V1{V=5V,I=-10mA,P=-50mW}
I1{I=100μA,V=-714.575mV,P=-71.457μW}
DUT{Vbe=714.575mV,Vbc=-4.285V,Vce=5V,Ie=-10.1mA,Ic=10mA,Ib=100.001μA}
```

---

## Netlist

```text
V ne gnd V=5
V ne nb V=0.65
BJT:DUT ne nb gnd @PNP
.dc
```

## Result

```text
V(ne)=5V
V(nb)=4.35V
V1{V=5V,I=-822.618μA,P=-4.113mW}
V2{V=650mV,I=-8.226μA,P=-5.347μW}
DUT{Vbe=-650mV,Vbc=4.35V,Vce=-5V,Ie=830.844μA,Ic=-822.618μA,Ib=-8.226μA}
```

---

## Netlist

```text
V ne gnd V=5
I nb ne I=0.0001
BJT:DUT ne nb gnd @PNP
.dc
```

## Result

```text
V(ne)=5V
V(nb)=4.285V
V1{V=5V,I=-10mA,P=-50mW}
I1{I=100μA,V=-714.661mV,P=-71.466μW}
DUT{Vbe=-714.661mV,Vbc=4.285V,Vce=-5V,Ie=10.134mA,Ic=-10.034mA,Ib=-100.337μA}
```
