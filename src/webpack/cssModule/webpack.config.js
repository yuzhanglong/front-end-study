/*
 * File: webpack.config.js
 * Description: CSS MODULE 的使用
 * Created: 2020-10-31 13:19:49
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const CSS_TEST = /\.css$/;

module.exports = {
  entry: './entry.js',
  output: {
    filename: './bundle.js',
  },
  module: {
    rules: [
      {
        test: CSS_TEST,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
    ],
  },
};
