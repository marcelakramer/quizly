/* eslint-disable @typescript-eslint/no-require-imports */
const sharedConfig = require("@teachy/config/eslint-config");

module.exports = {
  ...sharedConfig,
  extends: ["next/core-web-vitals", ...sharedConfig.extends],
  rules: {
    ...sharedConfig.rules,
    "no-html-link-for-pages": "off",
  },
};
