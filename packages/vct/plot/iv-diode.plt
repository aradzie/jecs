set term svg size 600, 400 dynamic
set output "iv-diode.svg"
set title "Diode I-V curve"
set xlabel "Diode voltage / V"
set ylabel "Diode current / A"
set grid lw 1
set border lw 1
set format y "%g"
set format x "%g"
plot 'iv-diode.data' using 1:2 with lines lw 1 title "Diode I/V"
