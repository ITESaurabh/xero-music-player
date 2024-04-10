const path = require('path');
const rules = require('./webpack.rules');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const assets = ['img'];

rules.push({
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
  ],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  externals: { 'react-native-fs': 'reactNativeFs' },
  target: 'electron-renderer',
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json', '.scss', '.sass'],
  },
  plugins: assets.map(asset => {
    console.log(asset);
    return new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, 'src', asset), to: asset }],
    });
  }),
};
