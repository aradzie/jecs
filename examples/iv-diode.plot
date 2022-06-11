set term svg size 600, 400 dynamic
set output "iv-diode.svg"
set border lw 1
set grid lw 1
set xlabel "Voltage / V"
set ylabel "Current / A"
plot "iv-diode.data" using 5:6 with lines lw 1 title "Diode I/V"
