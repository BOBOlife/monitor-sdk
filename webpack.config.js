const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  context: process.cwd(),
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  devServer: {
    // contentBase: path.join(__dirname, "dist"), // 静态文件目录
    static: {
      // directory: path.join(__dirname, "dist"),
      publicPath: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
    onBeforeSetupMiddleware: (devServer) => {
      if (!devServer) throw new Error("webpack-dev-server is not available");
      devServer.app.get("/success", (req, res) => {
        res.json({ id: 1001 }); // status code 200
      });
      devServer.app.post("/error", (req, res) => {
        res.sendStatus(500); // status code 500
      });
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      inject: "head",
    }),
  ],
};
