import type { WebpackPluginInstance } from "webpack";
import type IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

// Toggle this to enable/disable real-time TypeScript type checking during builds
const ENABLE_TYPE_CHECKING = false;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

export const plugins: WebpackPluginInstance[] = [
  ...(ENABLE_TYPE_CHECKING
    ? [new ForkTsCheckerWebpackPlugin({ logger: "webpack-infrastructure" })]
    : []),
];
