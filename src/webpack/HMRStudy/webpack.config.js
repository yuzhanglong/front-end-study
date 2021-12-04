/*
 * File: webpack.config.js
 * Description: webpack 热更新
 * Created: 2020-12-6 21:16:31
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    app: './src/index.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Hot Module Replacement',
    }),
  ],
  devtool: 'source-map',
  devServer: {
    hot: true,
  },
};
