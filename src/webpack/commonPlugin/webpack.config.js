/*
 * File: webpack.config.js
 * Description: 常见插件的使用
 * Created: 2020-10-31 14:03:13
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/entry.js',
  output: {
    filename: './bundle.js',
  },
  plugins: [new HtmlWebpackPlugin()],
}
