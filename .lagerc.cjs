"use strict";

module.exports = {
  pipeline: {
    clean: [],
    compile: ["^compile"],
    test: ["^test"],
    build: ["^build"],
  },

  npmClient: "npm",
};
