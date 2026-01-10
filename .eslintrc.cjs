/* eslint-disable @typescript-eslint/no-require-imports */
const sharedConfig = require("./packages/config/eslint-config");

module.exports = {
  ...sharedConfig,
  extends: [...sharedConfig.extends],
};
