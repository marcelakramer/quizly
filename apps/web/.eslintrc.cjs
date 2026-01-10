/* eslint-disable */
const sharedConfig = require("@teachy/config/eslint-config");

module.exports = {
  ...sharedConfig,
  extends: [...sharedConfig.extends],
};
