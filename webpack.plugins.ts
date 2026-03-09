import type { WebpackPluginInstance } from 'webpack';
import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import path from 'path';
import fs from 'fs';

// Toggle this to enable/disable real-time TypeScript type checking during builds
const ENABLE_TYPE_CHECKING = false;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// Resolve which .env file to load: prefer .env.local, fall back to .env
const envLocalPath = path.resolve(__dirname, '.env.local');
const envPath = path.resolve(__dirname, '.env');
const dotenvPath = fs.existsSync(envLocalPath) ? envLocalPath : envPath;

export const plugins: WebpackPluginInstance[] = [
  ...(ENABLE_TYPE_CHECKING
    ? [new ForkTsCheckerWebpackPlugin({ logger: 'webpack-infrastructure' })]
    : []),
  new Dotenv({ path: dotenvPath, safe: false, systemvars: true }),
];
