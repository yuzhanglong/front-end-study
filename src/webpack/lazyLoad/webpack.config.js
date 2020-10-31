/*
 * File: webpack.config.js
 * Description: 懒加载
 * Created: 2020-10-31 15:47:57
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: './bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
}
