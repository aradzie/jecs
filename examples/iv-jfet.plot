set term svg size 600, 400 dynamic
set output "iv-jfet.svg"
set border lw 1
set grid lw 1
set xlabel "Vds / V"
set ylabel "Id / A"
plot for [IDX=0:*] \
  "iv-jfet.data" \
  index IDX \
  using 9:10 \
  with lines lw 1 \
  title columnheader(1)
