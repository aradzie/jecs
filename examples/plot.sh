#!/usr/bin/env bash

for f in *.netlist; do echo "jecs $f"; jecs "$f"; done

for f in *.plot; do echo "gnuplot $f"; gnuplot "$f"; done
