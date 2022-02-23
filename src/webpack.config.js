const {resolve} = require('path');

module.exports = (env, argv) => ({
  context: __dirname,
  entry: {
    devtools: './devtools/main',
    panel: './panel/main',
    panelWorker: './panel/worker',
  },
  output: {
    path: resolve(__dirname, '../build/audion'),
  },
  devtool: argv.mode === 'development' ? 'source-map' : false,
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', {loader: 'css-loader', options: {modules: true}}],
      },
      {test: /\.tsx?$/, loader: 'ts-loader'},
      {test: /\.js$/, loader: 'source-map-loader'},
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        // More information here https://webpack.js.org/guides/asset-modules/
        type: 'asset',
      },
    ],
  },
});
