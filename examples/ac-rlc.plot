set term svg size 600, 400 dynamic
set output "ac-rlc.svg"
set border lw 1
set grid lw 1
set xlabel "frequency"
set ytics nomirror tc lt 1
set ylabel "voltage, V" tc lt 1
set y2tics nomirror tc lt 2
set y2label "phase, degrees" tc lt 2
set logscale x
set logscale y
plot \
  "ac-rlc.data" using 1:4 axes x1y1 with lines lw 1 title "voltage", \
  "ac-rlc.data" using 1:5 axes x1y2 with lines lw 1 title "phase"
