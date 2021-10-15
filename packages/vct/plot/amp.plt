set term svg size 600, 400 dynamic
set output "amp.svg"
set title "BJT Amplifier"
set xlabel "Vbe / V"
set grid lw 1
set border lw 1
set format y "%g"
set format x "%g"
plot 'amp.data' using 1:2 with lines lw 1 title "Vc(Vbe, Rl)"
