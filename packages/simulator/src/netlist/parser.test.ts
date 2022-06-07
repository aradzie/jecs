import test from "ava";
import { parse } from "./parser.js";

test("parse devices", (t) => {
  t.like(parse("R a b;"), {
    items: [
      {
        type: "instance",
        deviceId: {
          name: "R",
        },
        instanceId: null,
        nodes: [{ name: "a" }, { name: "b" }],
        modelId: null,
        properties: [],
      },
    ],
  });

  t.like(parse("R:R1 a b;"), {
    items: [
      {
        type: "instance",
        deviceId: {
          name: "R",
        },
        instanceId: {
          name: "R1",
        },
        nodes: [{ name: "a" }, { name: "b" }],
        modelId: null,
        properties: [],
      },
    ],
  });

  t.like(parse("R:R1 a b R=1;"), {
    items: [
      {
        type: "instance",
        deviceId: {
          name: "R",
        },
        instanceId: {
          name: "R1",
        },
        nodes: [{ name: "a" }, { name: "b" }],
        modelId: null,
        properties: [
          {
            id: {
              name: "R",
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

  t.like(parse("R:R1 a b R=1 T=27;"), {
    items: [
      {
        type: "instance",
        deviceId: {
          name: "R",
        },
        instanceId: {
          name: "R1",
        },
        nodes: [{ name: "a" }, { name: "b" }],
        modelId: null,
        properties: [
          {
            id: {
              name: "R",
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
            id: {
              name: "T",
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

  t.like(parse('BJT:Q1 e b c polarity="npn";'), {
    items: [
      {
        type: "instance",
        deviceId: {
          name: "BJT",
        },
        instanceId: {
          name: "Q1",
        },
        nodes: [{ name: "e" }, { name: "b" }, { name: "c" }],
        modelId: null,
        properties: [
          {
            id: {
              name: "polarity",
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
        id: { name: "$a" },
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
        id: { name: "$a" },
        value: {
          type: "binary",
          op: "+",
          arg1: {
            type: "literal",
            value: 1,
          },
          arg2: {
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
        id: { name: "$a" },
        value: {
          type: "func",
          id: { name: "sin" },
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
