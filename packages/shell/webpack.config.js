const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");
const APP_DIR = path.resolve(__dirname, "./src");
const MONACO_DIR = path.resolve(__dirname, "./node_modules/monaco-editor");

const mode = process.env.NODE_ENV || "production";

module.exports = {
  target: "web",
  mode,
  context: __dirname,
  entry: "./src/main.tsx",
  output: {
    path: path.join(__dirname, "build/"),
    filename: "[contenthash:16].js",
    chunkFilename: "[contenthash:16].js",
    assetModuleFilename: "[contenthash:16][ext]",
    publicPath: "./",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    fallback: {
      events: require.resolve("events/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        type: "javascript/auto",
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: "es2020",
              },
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        type: "javascript/auto",
        use: [
          {
            loader: "source-map-loader",
          },
        ],
      },
      {
        test: /\.css$/i,
        include: APP_DIR,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName:
                  mode === "production"
                    ? "[hash:base64]"
                    : "[path][name]__[local]--[hash:base64:5]",
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: MONACO_DIR,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
      {
        test: /\/assets\//,
        type: "asset",
      },
      {
        test: /\.txt$/i,
        type: "asset/source",
      },
    ],
  },
  devtool: "source-map",
  plugins: [
    new MonacoWebpackPlugin({
      languages: [],
      features: [],
    }),
    new HtmlWebpackPlugin({
      title: "Circuit Simulator",
      template: "./src/index.ejs",
    }),
  ],
};
