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
  devtool: argv.mode === 'development' ? 'eval' : false,
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: 'file-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', {loader: 'css-loader', options: {modules: true}}],
      },
      {test: /\.tsx?$/, loader: 'ts-loader'},
      {test: /\.js$/, loader: 'source-map-loader'},
    ],
  },
});
