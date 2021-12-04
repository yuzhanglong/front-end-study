/*
 * File: webpack.config.js
 * Description: 常见loaders的使用
 * Created: 2020-10-30 23:26:42
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const path = require('path');

const CSS_TEST = /\.css$/;
const TS_TEST = /\.ts?$/;
const SASS_TEST = /\.scss$/;
const IMAGE_TEST = /\.(png|jpg|gif)$/;

module.exports = {
  entry: './src/entry.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
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
          },
        ],
      },
      {
        test: TS_TEST,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: SASS_TEST,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: IMAGE_TEST,
        use: [
          {
            loader: 'url-loader',
            // 如果文件大于限制（以字节为单位），
            // 则不会转换成base64
            options: {
              limit: 20,
            },
          },
        ],
      },
    ],
  },
};
