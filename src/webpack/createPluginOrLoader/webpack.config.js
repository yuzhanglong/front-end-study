/*
 * File: webpack.config.js
 * Description: 常见插件的使用
 * Created: 2020-10-31 14:03:13
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");
module.exports = {
  entry: "./src/entry.js",
  output: {
    filename: './bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: path.resolve(__dirname, './src/loader.js'),
            options: {
              limit: 1000,
              encoding: "base64",
              generator: undefined,
              fallback: undefined
            }
          },
        ],
      },
    ]
  }
}
