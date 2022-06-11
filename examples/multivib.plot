set term svg size 600, 400 dynamic
set output "multivib.svg"
set border lw 1
set grid lw 1
set xlabel "time"
plot \
  "multivib.data" using 1:3 with lines lw 1 title "V1", \
  "multivib.data" using 1:4 with lines lw 1 title "V2"
