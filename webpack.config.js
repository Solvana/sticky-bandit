const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  context: __dirname,
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    extensions: ['.mjs', '.json', '.ts'],
    symlinks: false,
    cacheWithContext: false,
  },
  output: {
    libraryTarget: 'es5',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        loader: 'ts-loader',
        exclude: [[path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '.webpack')]],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    ],
  },
};
