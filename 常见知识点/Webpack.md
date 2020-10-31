# Webpack

参考：

https://www.webpackjs.com

https://github.com/ruanyf/webpack-demos

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
    pageOne: './index.js',
    pageTwo: './entry2.js',
  },
  output: {
    filename: './[name].js'
  }
};
```

### 常见loaders

下面的DEMO使用了一些`loaders`，它们分别是：

- css-loader
- style-loader
- sass-loader
- url-loader

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

### 常见Plugins

下面的DEMO使用了一些常见的**plugins**：

- HtmlWebpackPlugin（提供HTML模板）

#### 目录结构

![](http://cdn.yuzzl.top/blog/20201031150540.png)

#### 配置

```javascript
/*
 * File: webpack.config.js
 * Description: 常见插件的使用
 * Created: 2020-10-31 14:03:13
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./src/entry.js",
  output: {
    filename: './bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
}
```

### 环境变量注入

#### 介绍

我们可以向我们的代码注入一些**环境变量**，请看下面的js代码：

```javascript
document.write('<h1>Hello World</h1>');

if (__IS_PRODUCTION__) {
  document.write("这是生产环境~");
}
```

`__IS_PRODUCTION__`就是我们注入的环境变量，具体方式请看下面的webpack配置。

#### 目录结构

![](http://cdn.yuzzl.top/blog/20201031153352.png)



#### 配置

```javascript
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
```

### 模块懒加载（Lazyload）

#### 介绍

懒加载或者按需加载，是一种很好的优化网页或应用的方式。这种方式实际上是先把你的代码在一些逻辑断点处分离开，然后在一些代码块中完成某些操作后，立即引用或即将引用另外一些新的代码块。这样加快了应用的初始加载速度，减轻了它的总体体积，因为某些代码块可能永远不会被加载。

#### 实现

请看下面的JS代码：

```javascript
const Component = () => {
  let element = document.createElement('div');
  let button = document.createElement('button');
  let br = document.createElement('br');

  button.innerHTML = '单击我加载 print.js';
  element.innerHTML = "hello world~";
  element.appendChild(br);
  element.appendChild(button);
  button.onclick = () => import('./print')
    .then((m) => {
      m.default();
    });
  return element;
}

document.body.appendChild(Component());
```

我们可以看到，当按钮被单击时，会`import`当前目录下的`print.js`（新的代码块），减轻了初始加载的压力。

#### 配置

```javascript
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
```

### 代码分离

#### 总述

代码分离是 webpack 中最引人注目的特性之一。此特性能够把代码分离到不同的 bundle 中，然后可以按需加载或并行加载这些文件。代码分离可以用于获取更小的 bundle，以及控制资源加载优先级，如果使用合理，会极大影响加载时间。

有三种常用的代码分离方法：

- 入口起点：使用**entry**配置手动地分离代码（上面有案例）。
- 防止重复：使用 **CommonsChunkPlugin**去重和分离 chunk。
- 动态导入：通过模块的内联函数调用来分离代码。

#### 入口起点

##### 案例

关于多入口起点的方案上面已经介绍过了：<a href="#多个入口">传送门</a>

##### 缺点

- 如果入口 chunks 之间包含重复的模块，那些重复模块都会被引入到各个 bundle 中。
- 这种方法不够灵活，并且不能将核心应用程序逻辑进行动态拆分代码。

例如，下面是一次默认的多入口打包，这两个模块都导入了`lodash`这个库，这是公共的模块，不应该被重复导入。

![](http://cdn.yuzzl.top/blog/20201031183852.png)

可以看到两个模块都有大量重复的代码：
![](http://cdn.yuzzl.top/blog/20201031184233.png)

#### 解决重复的问题

使用`optimization.splitChunks`配置项，我们可以抽取公共代码：

```javascript
optimization: {
    splitChunks: {
      chunks: "async",
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: "common",
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  }
```

这表示创建一个`vendors`块，其中包括`node_modules`中的所有代码。

打包后结构如图：

![](http://cdn.yuzzl.top/blog/20201031185423.png)

可视化分析（使用`BundleAnalyzerPlugin`）：

![](http://cdn.yuzzl.top/blog/20201031185919.png)

#### 配置

```javascript
/*
 * File: webpack.config.js
 * Description: 代码拆分
 * Created: 2020-10-31 16:11:26
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: {
    index: './src/index.js',
    another: './src/another-module.js'
  },
  output: {
    filename: "[name].bundle.js",
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new BundleAnalyzerPlugin()
  ],
  optimization: {
    splitChunks: {
      chunks: "async",
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: "common",
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  }
}
```



## Webpack热更新（HMR）原理

### 什么是热更新？

**模块热替换**(HMR - Hot Module Replacement)功能会在应用程序运行过程中替换、添加或删除模块，而无需重新加载整个页面。主要是通过以下几种方式，来显著加快开发速度：

- 保留在完全重新加载页面时丢失的应用程序状态。
- 只更新变更内容，以节省宝贵的开发时间。
- 调整样式更加快速 - 几乎相当于在浏览器调试器中更改样式。

