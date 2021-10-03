import test from "ava";
import { dcAnalysis } from "../simulation/dc";
import { dumpCircuit } from "../simulation/debug";
import { readNetlist } from "../simulation/netlist";

test("circuit 1", (t) => {
  const circuit = readNetlist([
    ["g", ["g"], {}],
    ["i", ["g", "NP"], { i: 0.1 }],
    ["d/DUT", ["NP", "g"], {}],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NP)=774.237mV",
    "I1{Vd=-774.237mV,I=100mA}",
    "DUT{Vd=774.237mV,I=100.024mA,P=77.442mW}",
  ]);
});

test("circuit 2", (t) => {
  const circuit = readNetlist([
    ["g", ["g"], {}],
    ["i", ["g", "NP"], { i: 1 }],
    ["d/DUT1", ["NP", "NM"], {}],
    ["d/DUT2", ["NM", "g"], {}],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NP)=1.668V",
    "V(NM)=833.787mV",
    "I1{Vd=-1.668V,I=1A}",
    "DUT1{Vd=833.787mV,I=1A,P=833.811mW}",
    "DUT2{Vd=833.787mV,I=1A,P=833.811mW}",
  ]);
});

test("circuit 3", (t) => {
  const circuit = readNetlist([
    ["g", ["g"], {}],
    ["v", ["NP", "g"], { v: 0.8 }],
    ["d/DUT", ["NP", "g"], {}],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NP)=800mV",
    "V1{Vd=800mV,I=-270.827mA,P=-216.662mW}",
    "DUT{Vd=800mV,I=270.827mA,P=216.662mW}",
  ]);
});

test("circuit 4", (t) => {
  const circuit = readNetlist([
    ["g", ["g"], {}],
    ["v", ["NP", "g"], { v: 1.6 }],
    ["d/DUT1", ["NP", "NM"], {}],
    ["d/DUT2", ["NM", "g"], {}],
  ]);
  dcAnalysis(circuit);
  t.deepEqual(dumpCircuit(circuit), [
    "V(NP)=1.6V",
    "V(NM)=800mV",
    "V1{Vd=1.6V,I=-270.827mA,P=-433.323mW}",
    "DUT1{Vd=800mV,I=270.827mA,P=216.662mW}",
    "DUT2{Vd=800mV,I=270.827mA,P=216.662mW}",
  ]);
});
