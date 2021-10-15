#!/usr/bin/env bash

npx ts-node src/iv-diode.ts

cd plot

for f in *.plt; do gnuplot "$f"; done
