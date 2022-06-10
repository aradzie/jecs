set term svg size 600, 400 dynamic
set output "ac-c.svg"
set xlabel "time"
set border 0
set grid lw 1
set border lw 1
set format y "%g"
set format x "%g"
plot \
  'ac-c.data' using 1:7 with lines lw 1 title "Vc", \
  'ac-c.data' using 1:8 with lines lw 1 title "Ic"
