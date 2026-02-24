import path from 'path';
import type { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

const assets = ['img'];

rules.push({
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  externals: { 'react-native-fs': 'reactNativeFs' },
  target: 'electron-renderer',
  plugins: [
    ...plugins,
    ...assets.map(asset =>
      new CopyWebpackPlugin({
        patterns: [{ from: path.resolve(__dirname, 'src', asset), to: asset }],
      })
    ),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json', '.scss', '.sass'],
  },
};
