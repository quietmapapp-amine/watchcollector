const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "index.web.tsx"),
  devtool: "eval-cheap-module-source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    clean: true,
    publicPath: "/"
  },
  resolve: {
    extensions: [".web.tsx",".web.ts",".web.jsx",".web.js",".tsx",".ts",".jsx",".js",".json"],
    alias: {
      "react-native$": "react-native-web",
      // Map popular native libs to safe web stubs
      "@react-native-async-storage/async-storage": path.resolve(__dirname, "shims/AsyncStorage.web.ts"),
      "react-native-maps": path.resolve(__dirname, "shims/MapStub.web.tsx"),
      "@rnmapbox/maps": path.resolve(__dirname, "shims/MapStub.web.tsx"),
      "react-native-permissions": path.resolve(__dirname, "shims/NativeStub.web.ts"),
      "react-native-device-info": path.resolve(__dirname, "shims/NativeStub.web.ts"),
      "react-native-keychain": path.resolve(__dirname, "shims/NativeStub.web.ts")
    },
    fallback: {
      "crypto": false,
      "stream": false,
      "path": false,
      "fs": false
    }
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: (modulePath) =>
          /node_modules/.test(modulePath) && !/react-native-/.test(modulePath),
        use: {
          loader: "babel-loader",
          options: {
            configFile: path.resolve(__dirname, ".babelrc")
          }
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader","css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html")
    })
  ],
  devServer: {
    static: { directory: path.resolve(__dirname) },
    port: 5173,
    hot: true,
    open: true,
    historyApiFallback: true
  }
};
