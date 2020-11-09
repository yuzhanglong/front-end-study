# Webpack

参考：

https://github.com/ruanyf/webpack-demos

https://www.webpackjs.com/contribute/writing-a-loader

https://zhuanlan.zhihu.com/p/44438844

https://juejin.im/post/6844903544756109319

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
    pageOne: './basic_redux.js',
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
  entry: "./src/basic_redux.js",
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
    index: './src/basic_redux.js',
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

### 探索Create React App

TODO

## Webpack构建流程

Webpack 的运行流程是一个**串行**的过程，从启动到结束会依次执行以下流程：

1. **初始化参数**：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数。
2. **开始编译**：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译。
3. **确定入口**：根据配置中的 entry 找出所有的入口文件。
4. **编译模块**：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。
5. **完成模块编译**：在经过第4步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系。
6. **输出资源**：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会。
7. **输出完成**：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

## Webpack热更新（HMR）原理

### 什么是热更新？

**模块热替换**(HMR - Hot Module Replacement)功能会在应用程序运行过程中替换、添加或删除模块，而无需重新加载整个页面。主要是通过以下几种方式，来显著加快开发速度：

- 保留在完全重新加载页面时丢失的应用程序状态。
- 只更新变更内容，以节省宝贵的开发时间。
- 调整样式更加快速 - 几乎相当于在浏览器调试器中更改样式。

## loader和Plugin

### 实践：编写一个plugin

TODO

### 实践：编写一个loader

接下来我们来写一个简单的`url-loader` -- 它把项目中图片类型的文件转换成`base64`等格式。

**务必**先访问`https://www.webpackjs.com/contribute/writing-a-loader`了解官方写给loader编写者的文档。

#### 准备工作

##### entry.js

```javascript
import img from './img-test.jpg';

document.write('hello world!');
console.log(img);
```

##### webpack.config.js

```javascript
/*
 * File: webpack.config.js
 * Description: 编写一个loader
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
          },
        ],
      },
    ]
  }
}

```

然后准备一张图片，新建我们的`loader.js`,目录结构如图。

![](http://cdn.yuzzl.top/blog/20201103201937.png)

#### 需求分析

我们的loader可能需要这些功能：

- 文件转换大小限制（**limit**） -- 我们都知道，图片资源文件太大使用base64得不偿失（base64实际上扩大体积了），所以我们需要一个上限值。
- 编码格式（**encoding**），调用者可以自定义格式，例如**utf-8**，甚至用户可以**自定义编码函数**（**generator**）。
- 其他的loader（**fallback**），如果文件大小超出限制，我们可能需要调用其他的loader，这个loader也需要让用户决定。

加粗的单词将成为我们的选项参数。

#### Helloworld

请看下图，这是一个hello world版的**loader**，最终我们在浏览器控制台获得我们的图片资源`source`被转换成了“hello world”，然后按官方文档上的规定处理成字符串被导出。

  ```javascript
return `export default ${JSON.stringify(source)}`;
  ```

![](http://cdn.yuzzl.top/blog/20201105215106.png)

#### 获取参数

向外界暴露参数。需要用到官方提供的loader工具库。

回顾前面的需求分析，我们要实现五个参数的处理。

- limit - 大小限制
- encoding - 转码类型
- generator - 自定义转换
- fallback - 备用loader

下面是获取参数的案例，通过调用官方提供的getOptions，获取`webpack.config.js`这个loader下的可选参数。

```javascript
const loaderUtils = require("loader-utils");

module.exports = function (source) {
  // Loader Options
  const options = loaderUtils.getOptions(this) || {};
  console.log(options);
  // 对资源应用一些转换……
  source = "hello world";
  return `export default ${JSON.stringify(source)}`;
};
```

![](http://cdn.yuzzl.top/blog/20201103204340.png)

#### 完成业务逻辑

接下来就是完成业务逻辑了，内容如下：

```javascript
const path = require("path");
const loaderUtils = require("loader-utils");
const mime = require("mime-types");

// 默认编码
const DEFAULT_ENCODING = "base64";

// 是否需要转换
const shouldTransform = (limit, size) => {
  // Boolean类型，返回自身即可
  if (typeof limit === "boolean") {
    return limit;
  }
  if (typeof limit === "string") {
    return size <= parseInt(limit);
  }
  if (typeof limit === "number") {
    return size <= limit;
  }
  return true;
}

// 获取文件MIME类型
const getMimetype = (mimetype, resourcePath) => {
  const resolvedMimeType = mime.contentType(path.extname(resourcePath));
  if (resolvedMimeType) {
    return "";
  }
  return resolvedMimeType.replace(/;\s+charset/i, ';charset');
}

// 转码文件
const encodeData = (content, generator, mimetype, encoding, resourcePath) => {
  if (generator) {
    return generator(content, mimetype, encoding, resourcePath);
  }
  content = Buffer.from(content);
  return `data:${mimetype}${encoding ? `;${encoding}` : ''},${content.toString(encoding || undefined)}`;
}

// 这里不要用箭头函数，注意this的指向！
module.exports = function (source) {
  // 获取选项
  const options = loaderUtils.getOptions(this) || {};
  // 我们需要转换
  if (shouldTransform(options.limit, source.length)) {
    // 获取路径
    const resourcePath = this.resourcePath;
    // 获取文件MIME
    const mimetype = getMimetype(options.mimetype, resourcePath);
    source = encodeData(source, options.generator, mimetype, options.encoding || DEFAULT_ENCODING, resourcePath);
  }
  return `export default ${JSON.stringify(source)}`;
};
```

## Webpack如何提高前端性能

### 总述

用webpack优化前端性能是指优化webpack的输出结果，让打包的最终结果在浏览器运行快速高效。

### 代码级别的压缩

这个前面的前端基础篇已经说过了，删除多余的代码、注释、简化代码的写法等等方式。可以利用webpack的`UglifyJsPlugin`和`ParallelUglifyPlugin`来压缩JS文件，  利用`cssnano`来压缩css。

### CDN加速

构建时修改静态资源路径。可以利用webpack对于`output`参数和各loader的`publicPath`参数来修改资源路径。

### 公共代码提取

使用`optimization.splitChunks`配置项，我们可以抽取公共代码。

关于公共代码提取的详细内容请参考：<a href="#代码分离">代码分离</a>

### TreeShaking

**tree shaking**是一个术语，通常用于描述移除 JavaScript上下文中的未引用代码(dead-code)。将代码中永远不会走到的片段删除掉。（也就是我们常说的“**按需加载**”）。

TODO：原理（这个技术其实变化非常大）

### ScopeHoisting

TODO
