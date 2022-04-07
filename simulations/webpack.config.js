const {resolve} = require('path');

const srcConfig = require('../src/webpack.config');

module.exports = (env, argv) => ({
  ...srcConfig(env, argv),
  entry: {
    updateGraphRender: resolve(__dirname, './updateGraphRender'),
  },
  output: {
    path: resolve(__dirname, './build'),
  },
});
