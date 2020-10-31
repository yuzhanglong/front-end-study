# Webpack

## 经典配置案例

所用的案例实践代码都放在了`src/webpack`下。

使用webpack的版本：![](https://img.shields.io/npm/v/webpack.svg?label=webpack&style=flat-square&maxAge=3600)

### 单个入口

#### 目录结构

![](http://cdn.yuzzl.top/blog/20201031130841.png)

#### 配置

```javascript
module.exports = {
  entry: './entry.js',
  output: {
    filename: 'bundle.js'
  }
};
```

### 多个入口

#### 目录结构

![](http://cdn.yuzzl.top/blog/20201031131101.png)

#### 配置

```javascript
module.exports = {
  entry: {
    pageOne: './entry1.js',
    pageTwo: './entry2.js',
  },
  output: {
    filename: './[name].js'
  }
};
```

### 常见loaders

#### 目录结构

![](http://cdn.yuzzl.top/blog/20201031131256.png)

#### 配置

```javascript
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
  entry: "./src/entry.ts",
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: CSS_TEST,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
        ]
      },
      {
        test: TS_TEST,
        use: {
          loader: 'ts-loader'
        }
      },
      {
        test: SASS_TEST,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "sass-loader"
          }
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
              limit: 20
            }
          }
        ]
      }
    ]
  }
}
```

### CSS局部作用域(CSS Module)

如果你使用过React，那么你一定知道**CSSModule**，CSSModule给你的CSS文件一个局部作用域而不是全局。

#### CSS Module特点

我们的CSS文件如下：

```css
/* 局部模式 */
.class1 {
    background-color: #409EFF;
}

/* 全局模式 */
:global(.class2) {
    background-color: red;
}

/* 全局模式 */
div {
    height: 200px;
}
```

请看下面的JS代码(也是本案例的入口)，它导入了上面的CSS：

```javascript
import style from "./style.css";

console.log("Hello CSS Module!");

// css module
document.write(`<div class="${style.class1}"></div>`);

```

注意这一行：

```javascript
document.write(`<div class="${style.class1}"></div>`);
```

我们向DOM中写入了一个`<div>`，它的类名为`class1`。在webpack的帮助下，这个class1会被转成一个唯一值，这样我们不会和全局的冲突，并且起到了模块化的效果。

来看看效果：

![](http://cdn.yuzzl.top/blog/20201031140119.png)

#### 目录结构

![](http://cdn.yuzzl.top/blog/20201031135344.png)

#### 配置代码

```javascript
/*
 * File: webpack.config.js
 * Description: CSS MODULE 的使用
 * Created: 2020-10-31 13:19:49
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const CSS_TEST = /\.css$/;

module.exports = {
  entry: "./entry.js",
  output: {
    filename: './bundle.js',
  },
  module: {
    rules: [
      {
        test: CSS_TEST,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ]
  }
}
```



## Webpack热更新（HMR）原理

### 什么是热更新？

**模块热替换**(HMR - Hot Module Replacement)功能会在应用程序运行过程中替换、添加或删除模块，而无需重新加载整个页面。主要是通过以下几种方式，来显著加快开发速度：

- 保留在完全重新加载页面时丢失的应用程序状态。
- 只更新变更内容，以节省宝贵的开发时间。
- 调整样式更加快速 - 几乎相当于在浏览器调试器中更改样式。

