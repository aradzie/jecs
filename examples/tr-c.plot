set term svg size 600, 400 dynamic
set output "tr-c.svg"
set border lw 1
set grid lw 1
set xlabel "time"
set ytics nomirror tc lt 1
set ylabel "voltage, V" tc lt 1
set y2tics nomirror tc lt 2
set y2label "current, A" tc lt 2
plot \
  "tr-c.data" using 1:5 axes x1y1 with lines lw 1 title "Vc", \
  "tr-c.data" using 1:6 axes x1y2 with lines lw 1 title "Ic"
