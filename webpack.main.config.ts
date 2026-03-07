import path from 'path';
import type { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  externals: {
    'react-native-fs': 'reactNativeFs',
    ...(process.env.NODE_ENV === 'development' && { 'better-sqlite3': 'commonjs better-sqlite3' }),
  },
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'src', 'loader.html'),
          to: '.',
        },
        {
          from: path.join(__dirname, 'src', 'main', 'utils', 'musicScanWorker.js'),
          to: '.',
        },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json', '.scss', '.sass'],
  },
};
