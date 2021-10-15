#!/usr/bin/env bash

npx ts-node src/iv-diode.ts
npx ts-node src/iv-bjt.ts

cd plot

for f in *.plt; do gnuplot "$f"; done
