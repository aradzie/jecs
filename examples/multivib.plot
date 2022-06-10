set term svg size 600, 400 dynamic
set output "multivib.svg"
set xlabel "time"
set border 0
set grid lw 1
set border lw 1
set format y "%g"
set format x "%g"
plot \
  'multivib.data' using 1:3 with lines lw 1 title "V1", \
  'multivib.data' using 1:4 with lines lw 1 title "V2"
