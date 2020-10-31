/*
 * File: webpack.config.js
 * Description: 环境变量注入
 * Created: 2020-10-31 14:03:13
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devFlagPlugin = new webpack.DefinePlugin({
  __IS_PRODUCTION__: !process.env.DEBUG
});

module.exports = {
  entry: "./entry.js",
  output: {
    filename: './bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin(),
    devFlagPlugin
  ],
}
