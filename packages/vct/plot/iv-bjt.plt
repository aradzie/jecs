set term svg size 600, 400 dynamic
set output "iv-bjt.svg"
set title "BJT I-V curve"
set xlabel "Vce / V"
set ylabel "Ic / A"
set grid lw 1
set border lw 1
set format y "%g"
set format x "%g"
plot 'iv-bjt.data' using 1:2 with lines lw 1 title "Ic(Vbe)"
