const {resolve} = require('path');

module.exports = {
  context: __dirname,
  entry: {
    background: './background/main',
    devtools: './devtools/main',
    panel: './panel/main',
  },
  output: {
    path: resolve(__dirname, '../build/audion'),
  },
};
