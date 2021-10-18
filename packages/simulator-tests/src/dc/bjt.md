## Netlist

```text
Ground [g];
V [NC g] v=5;
V [NB g] v=0.65;
BJT:DUT [g NB NC] polarity="npn";
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(NC)=5V
V(NB)=650mV
V1{Vd=5V,I=-822.618μA,P=-4.113mW}
V2{Vd=650mV,I=-8.226μA,P=-5.347μW}
DUT{Vbe=650mV,Vbc=-4.35V,Vce=5V,Ie=-830.844μA,Ic=822.618μA,Ib=8.226μA}
```

---

## Netlist

```text
Ground [g];
V [NC g] v=5;
I [g NB] i=0.0001;
BJT:DUT [g NB NC] polarity="npn";
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(NC)=5V
V(NB)=714.574mV
V1{Vd=5V,I=-10mA,P=-50mW}
I1{Vd=-714.574mV,I=100μA}
DUT{Vbe=714.574mV,Vbc=-4.285V,Vce=5V,Ie=-10.1mA,Ic=10mA,Ib=100μA}
```

---

## Netlist

```text
Ground [g];
V [NE g] v=5;
V [NE NB] v=0.65;
BJT:DUT [NE NB g] polarity="pnp";
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(NE)=5V
V(NB)=4.35V
V1{Vd=5V,I=-822.618μA,P=-4.113mW}
V2{Vd=650mV,I=-8.226μA,P=-5.347μW}
DUT{Vbe=-650mV,Vbc=4.35V,Vce=-5V,Ie=830.844μA,Ic=-822.618μA,Ib=-8.226μA}
```

---

## Netlist

```text
Ground [g];
V [NE g] v=5;
I [NB NE] i=0.0001;
BJT:DUT [NE NB g] polarity="pnp";
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(NE)=5V
V(NB)=4.285V
V1{Vd=5V,I=-10mA,P=-50mW}
I1{Vd=-714.574mV,I=100μA}
DUT{Vbe=-714.574mV,Vbc=4.285V,Vce=-5V,Ie=10.1mA,Ic=-10mA,Ib=-100μA}
```
