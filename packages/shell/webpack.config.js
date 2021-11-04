const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  target: "web",
  mode: process.env.NODE_ENV || "production",
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
        type: "asset/resource",
      },
      {
        test: /\.txt$/i,
        type: "asset/source",
      },
    ],
  },
  devtool: "source-map",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Circuit Simulator",
      template: "index.ejs",
    }),
  ],
};
