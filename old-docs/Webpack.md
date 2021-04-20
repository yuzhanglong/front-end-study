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
module.exports = {
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

## Webpack如何提高前端性能

### 总述

用webpack优化前端性能是指优化webpack的输出结果，让打包的最终结果在浏览器运行快速高效。

### 代码级别的压缩

这个前面的前端基础篇已经说过了，删除多余的代码、注释、简化代码的写法等等方式。可以利用webpack的`UglifyJsPlugin`和`ParallelUglifyPlugin`来压缩JS文件， 利用`cssnano`来压缩css。

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

## SourceMap

如果我们将代码发布到生产环境，这些代码必然经历过混淆和压缩，但是如果在生产环境下出现报错，我们根据浏览器的提示消息是无法找到错误来源的，我们期望有这样一个关系 -- 被混淆的代码的某行可以对应到开发环境的代码上，于是我们就需要**
SourceMap**。

### 实践

#### webpack.config.js

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```

#### index.js

```javascript
let helloworld = "hello!!!!"
console.log(helloworld);
console.log(helloworld);
console.log("hello");
```

#### bundle.js

```javascript
(() => {
  let l = "hello!!!!";
  console.log(l), console.log(l), console.log("hello")
})();
//# sourceMappingURL=bundle.js.map
```

`sourceMappingURL=bundle.js.map`指向的就是Map文件。

#### sourceMap文件

来看Map文件，下面以注释的形式给出解释。

```javascript
const a = {
  "version": 3,
  // SourceMap的版本，目前为3
  "sources": [
    // 转换前的文件，该项是一个数组，表示可能存在多个文件合并
    "webpack://source-map/./src/index.js"
  ],
  "names": [
    // 转换前的文件，该项是一个数组，表示可能存在多个文件合并
    "helloworld",
    "console",
    "log"
  ],
  "mappings": "MAAA,IAAIA,EAAa,YACjBC,QAAQC,IAAIF,GACZC,QAAQC,IAAIF,GACZC,QAAQC,IAAI,U",
  //记录位置信息的字符串
  "file": "bundle.js",
  //转换后的文件名
  "sourcesContent": [
    "let helloworld = \"hello!!!!\"\r\nconsole.log(helloworld);\r\nconsole.log(helloworld);\r\nconsole.log(\"hello\");\r\n"
    //转换前的文件内容列表，与sources列表依次对应
  ],
  "sourceRoot": ""
  //转换前的文件所在的目录。如果与转换前的文件在同一目录，该项为空
}
```

##### mappings属性

Mapping属性有以下含义：

- 以分号（;）标识编译后代码的每一行
- 以逗号（,）标识编译后代码该行中的每一个映射位置
- 以5组VLQ编码字段标识源码和编译后代码的具体映射信息，其中：
    - 第一位，表示这个位置在（转换后的代码的）的第几列。
    - 第二位，表示这个位置属于sources属性中的哪一个文件。
    - 第三位，表示这个位置属于转换前代码的第几行。
    - 第四位，表示这个位置属于转换前代码的第几列。
    - 第五位，表示这个位置属于names属性中的哪一个变量。

例如，上面的MAAA表示**转换后代码的第6列**，**sources属性的第一个文件**，**转换前代码第一行**，**转换前代码的第一列**，代表`let`。

再比如，IAAIA表示**转换后代码的第4列**，**sources属性的第一个文件**，**转换前代码第一行**，**转换前代码的第4列**，对于第一个变量`helloworld`。

##### VLQ编码

来看mozilla官方提供的VLQ编码处理源码：

```javascript
const base64 = require("./base64");

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

const VLQ_BASE_SHIFT = 5;

// binary: 100000
const VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
const VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
const VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  let encoded = "";
  let digit;

  let vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};
```

计算的过程如下，我们以16作为例子：

- 调用`toVLQSigned`，向最右边补充符号位，16为正数，补充0
- 从右边的最低位开始，将整个数每隔5位，进行分段。即向右移位，第一次为`100000 >>> 5 `，为**1**，第二次为`000001 >>> 5`，为**0**
- 将两段的顺序倒过来，即**00000**和**00001**
- 在每一段的最前面添加一个"连续位"，除了最后一段为0，其他都为1，即变成**100000**和**000001**。
- 最终将每一段base64编码。
