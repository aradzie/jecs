import test from "ava";
import { parse } from "./parser";

test("parse definitions", (t) => {
  t.like(parse("R [a b];"), {
    items: [
      {
        type: "definition",
        deviceId: {
          id: "R",
        },
        id: null,
        nodes: [{ id: "a" }, { id: "b" }],
        properties: [],
      },
    ],
  });

  t.like(parse("R:R1 [a b];"), {
    items: [
      {
        type: "definition",
        deviceId: {
          id: "R",
        },
        id: {
          id: "R1",
        },
        nodes: [{ id: "a" }, { id: "b" }],
        properties: [],
      },
    ],
  });

  t.like(parse("R:R1 [a b] R=1;"), {
    items: [
      {
        type: "definition",
        deviceId: {
          id: "R",
        },
        id: {
          id: "R1",
        },
        nodes: [{ id: "a" }, { id: "b" }],
        properties: [
          {
            name: {
              id: "R",
            },
            value: {
              type: "exp",
              value: {
                type: "literal",
                value: 1,
              },
            },
          },
        ],
      },
    ],
  });

  t.like(parse("R:R1 [a b] R=1 T=27;"), {
    items: [
      {
        type: "definition",
        deviceId: {
          id: "R",
        },
        id: {
          id: "R1",
        },
        nodes: [{ id: "a" }, { id: "b" }],
        properties: [
          {
            name: {
              id: "R",
            },
            value: {
              type: "exp",
              value: {
                type: "literal",
                value: 1,
              },
            },
          },
          {
            name: {
              id: "T",
            },
            value: {
              type: "exp",
              value: {
                type: "literal",
                value: 27,
              },
            },
          },
        ],
      },
    ],
  });

  t.like(parse('BJT:Q1 [e b c] polarity="npn";'), {
    items: [
      {
        type: "definition",
        deviceId: {
          id: "BJT",
        },
        id: {
          id: "Q1",
        },
        nodes: [{ id: "e" }, { id: "b" }, { id: "c" }],
        properties: [
          {
            name: {
              id: "polarity",
            },
            value: {
              type: "string",
              value: "npn",
            },
          },
        ],
      },
    ],
  });
});

test("parse equations", (t) => {
  t.like(parse(".eq $a=1;"), {
    items: [
      {
        type: "equation",
        name: { id: "$a" },
        value: {
          type: "literal",
          value: 1,
        },
      },
    ],
  });

  t.like(parse(".eq $a=1+2;"), {
    items: [
      {
        type: "equation",
        name: { id: "$a" },
        value: {
          type: "binary",
          op: "+",
          a: {
            type: "literal",
            value: 1,
          },
          b: {
            type: "literal",
            value: 2,
          },
        },
      },
    ],
  });

  t.like(parse(".eq $a=sin(1);"), {
    items: [
      {
        type: "equation",
        name: { id: "$a" },
        value: {
          type: "func",
          id: { id: "sin" },
          args: [
            {
              type: "literal",
              value: 1,
            },
          ],
        },
      },
    ],
  });
});
