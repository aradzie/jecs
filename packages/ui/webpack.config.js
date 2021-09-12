const { join } = require("path");

module.exports = {
  target: "web",
  mode: process.env.NODE_ENV || "production",
  context: __dirname,
  entry: "./src/main.tsx",
  output: {
    path: join(__dirname, "build"),
    filename: "bundle.js",
    chunkFilename: "[contenthash:16][ext]",
    assetModuleFilename: "[contenthash:16][ext]",
    publicPath: "/assets/",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
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
        test: /\.(js)$/,
        use: [
          {
            loader: "source-map-loader",
          },
        ],
      },
      {
        test: /\.(css)$/,
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
    ],
  },
  devtool: "source-map",
  performance: {
    hints: false,
    maxAssetSize: 1048576,
    maxEntrypointSize: 1048576,
  },
};
