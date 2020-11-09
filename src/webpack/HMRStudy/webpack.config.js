/*
 * File: webpack.config.js
 * Description: webpack 热更新
 * Created: 2020-11-1 11:53:14
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");
const webpack = require('webpack');

module.exports = {
  entry: "./src/entry.js",
  output: {
    filename: './bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 9000,
    hot: true,
    inline: false
  }
}
