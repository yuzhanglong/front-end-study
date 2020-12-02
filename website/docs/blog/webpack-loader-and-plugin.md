# webpack-loader & plugin 详解

## 总述

本文将介绍并带你手写一个 **webpack-loader** 和一个 **webpack-plugin**，旨在更好地了解webpack的运行机制，以及满足我们的**好奇心**。

本文的大纲如下：
- 介绍 **loader**，**plugin** 的概念，并介绍使用方式。
- 写一个 **url-loader**，这个loader会将图片等资源文件转换成 `base64` 表示。
- 介绍 webpack **插件机制**。
- 写一个 **html-externals-webpack-plugin**，这个 plugin 基于 html-webpack-plugin，可以向 HTML 模板插入 CDN 的 `<script>` 标签。

## loader 和 plugin

### loader

我们都知道，webpack 自身只理解 JavaScript， 通过 loader 我们可以将各种类型的文件转换成 webpack 可处理的模块，例如，将一个图片转换成 Base54 字符串，或者将 JSX 代码转换成 JavaScript代码... 

#### 案例

如何使用？ 来看下面这个案例：

下面的DEMO使用了一些`loaders`，它们分别是：

- css-loader
- style-loader
- sass-loader
- url-loader

##### 目录结构

![](http://cdn.yuzzl.top/blog/20201031131256.png)

##### 配置

```javascript
/*
 * File: webpack.config.js
 * Description: 常见loaders的使用
 * Created: 2020-11-30 23:53:13
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
##### 解释

最终 webpack 打包的结果就是一个 js 文件， 没有任何的 .css 文件（当然，我们实际开发不会这样做），这是因为 .css 的内容全部被写入了 js 中，并且在执行的时候以**添加script标签**的方式来生成 css 样式，从打包后的代码我们也可以看出来：

![](http://cdn.yuzzl.top/blog/20201130235941.png)

这就是 loader 的功能。

### plugin

plugin 用来执行更复杂的任务，例如包优化，打包资源管理和环境变量的注入。

#### 案例

使用 HtmlWebpackPlugin（提供HTML模板）

#### 目录结构

![](http://cdn.yuzzl.top/blog/20201031150540.png)

#### 配置

```javascript
/*
 * File: webpack.config.js
 * Description: 常见插件的使用
 * Created: 2020-12-2 17:42:59
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


## 手写一个 loader

接下来我们来写一个简单的`url-loader` -- 它把项目中图片类型的文件转换成`base64`等格式。

**务必**先访问`https://www.webpackjs.com/contribute/writing-a-loader`了解官方写给loader编写者的文档。

### 准备工作

```javascript
// entry.js
import img from './img-test.jpg';

document.write('hello world!');
console.log(img);
```


```javascript
// webpack.config.js

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

### 需求分析

我们的loader可能需要这些功能：

- 文件转换大小限制（**limit**） -- 我们都知道，过大的图片资源文件使用 base64 格式得不偿失（base64实际上扩大体积了），所以我们需要一个上限值。
- 编码格式（**encoding**），调用者可以自定义格式，例如 **utf-8**，甚至用户可以**自定义编码函数**（**generator**）。
- 其他的 loader（**fallback**），如果文件大小超出限制，我们可能需要调用其他的loader 来处理这个文件，这个loader也需要让用户决定。

上面加粗的单词将成为我们的选项参数。

### Helloworld

请看下图，这是一个hello world版的**loader**，最终我们在浏览器控制台获得我们的图片资源`source`被转换成了“hello world”，然后按官方文档上的规定处理成字符串被导出。

![](http://cdn.yuzzl.top/blog/20201105215106.png)

```javascript
return `export default ${JSON.stringify(source)}`;
```

### 获取参数

向外界暴露参数。需要用到官方提供的loader工具库。

回顾前面的需求分析，我们要实现五个参数的处理。

- limit - 大小限制
- encoding - 转码类型
- generator - 自定义转换
- fallback - 备用loader

下面是获取参数的案例，通过调用官方提供的 getOptions，获取`webpack.config.js`这个loader下的可选参数。

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

### 完成业务逻辑

接下来就是完成业务逻辑了，内容如下，细节内容请看注释：

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

## webpack 的插件机制

webpack 的插件开发比 loader 要复杂的多，下面我们介绍一下它的插件机制。

### tabable

tabable 是一个 webpack 的核心库。事实上，Webpack可以将其理解是一种基于**事件流**的编程范例。`tapable` 暴露出挂载 plugin 的方法，使我们能让 plugin 在 webpack 事件流上运行。


### tabable 和 webpack

tabable 如何和 webpack 进行关联？我们可以进入 **html-webpack-plugin** 一探究竟，通过实际案例来感受。

##### 利用 compiler 的 emit hook 

html-webpack-plugin 利用 compiler 的 emit hook。emit 指 webpack 生成资源到 `output` 目录之前的阶段。在这里我们可以拿到编译好的内容。

![](http://cdn.yuzzl.top/blog/20201202002211.png)

##### 利用自定义hook

**html-webpack-plugin** 利用 `tabable` 实现了自定义hook，我们可以在各个阶段对 html-webpack-plugin 处理的内容进行一些修改，我们之后要写的 plugin 就是基于此的。

html-webpack-plugin 的基本流程如下图：

![](http://cdn.yuzzl.top/blog/flow.png)

举个例子。来看源码，下图的业务是获取Favicon公共路径 Promise，执行 `then` 方法可以接收到 `faviconPath`，然后再返回 `beforeAssetTagGeneration` 的钩子，这就是自定义 hook：

![](http://cdn.yuzzl.top/blog/20201202162156.png)

进入 getHtmlWebpackPluginHooks 来看一下：

```javascript
const htmlWebpackPluginHooksMap = new WeakMap();
function getHtmlWebpackPluginHooks (compilation) {
  let hooks = htmlWebpackPluginHooksMap.get(compilation);
  // Setup the hooks only once
  if (hooks === undefined) {
    hooks = createHtmlWebpackPluginHooks();
    htmlWebpackPluginHooksMap.set(compilation, hooks);
  }
  return hooks;
}

function createHtmlWebpackPluginHooks () {
  return {
    beforeAssetTagGeneration: new AsyncSeriesWaterfallHook(['pluginArgs']),
    alterAssetTags: new AsyncSeriesWaterfallHook(['pluginArgs']),
    alterAssetTagGroups: new AsyncSeriesWaterfallHook(['pluginArgs']),
    afterTemplateExecution: new AsyncSeriesWaterfallHook(['pluginArgs']),
    beforeEmit: new AsyncSeriesWaterfallHook(['pluginArgs']),
    afterEmit: new AsyncSeriesWaterfallHook(['pluginArgs'])
  };
}

module.exports = {
  getHtmlWebpackPluginHooks
};
```
全局所有的 `hook` 都被存储在这里，`htmlWebpackPluginHooksMap` 是一个 weakmap，它根据 `compilation` 来区分，为什么要区分多个？其实 html-webpack-plugin 是支持**多个 plugin 对象**的，我们可以渲染多份模板，像这样：

```javascript
{
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'test.html',
      template: 'src/assets/test.html'
    })
  ]
}
```

回到主题，html-webpack-plugin 提供的 `hooks` 其实是这些东西：

```javascript
{
    beforeAssetTagGeneration: new AsyncSeriesWaterfallHook(['pluginArgs']),
    alterAssetTags: new AsyncSeriesWaterfallHook(['pluginArgs']),
    alterAssetTagGroups: new AsyncSeriesWaterfallHook(['pluginArgs']),
    afterTemplateExecution: new AsyncSeriesWaterfallHook(['pluginArgs']),
    beforeEmit: new AsyncSeriesWaterfallHook(['pluginArgs']),
    afterEmit: new AsyncSeriesWaterfallHook(['pluginArgs'])
}
```

作为 hook 的使用者，我们可以通过以下的方案调用 hook：

```javascript
// htmlWebpackPlugin 暴露的 hook 方法，本质上调用了上面的 `getHtmlWebpackPluginHooks`
const hooks = this.htmlWebpackPlugin.getHooks(compilation);

// 我们以 beforeAssetTagGeneration 为例：
hooks.beforeAssetTagGeneration.tap('htmlExternalWebpackPlugin', (assets, outputName, plugin) => {
  // TODO: 在这个钩子（beforeAssetTagGeneration）上做点什么......
});
```

上面的 assets, outputName, plugin 由 hook 开发者定义。

作为插件的开发者，我们想执行用户的自定义 hook 只需要通过调用 `[yourHook].promise` 方法，并传入相应的参数，例如：

```javascript
yourHook.promise({
  assets: assets,
  outputName: childCompilationOutputName,
  plugin: self
});
```

> 提示：执行 hook 的方案不仅可以通过 promise ，具体可查阅 tabable 官方文档。


## 手写一个 plugin

### 需求分析

很多使用 webpack 打包的项目都会使用 html-webpack-plugin，这是一个很强大的 html 模板生成插件，现在我们基于它来写一个 plugin，以实现向模板中插入 CDN 的 `<script>` 标签的功能，我们期望的效果如下：

我们使用这个 plugin，并配置了三个 CDN 链接：

```javascript
// webpack.config.js
const HtmlExternalsWebpackPlugin = require('html-externals-webpack-plugin');
module.exports = {
  plugins: [
        // inserts externals into html
        isEnvProduction && new HtmlExternalsWebpackPlugin(HtmlWebpackPlugin, [
          'https://cdn.jsdelivr.net/npm/react@16.13.1/umd/react.production.min.js',
          'https://cdn.jsdelivr.net/npm/react-dom@16.13.1/umd/react-dom.production.min.js',
          'https://cdn.jsdelivr.net/npm/react-router@5.2.0/umd/react-router.min.js',
        ])
  ]
}
```

可以看到，HTML 模板中自动插入了三个链接：

```html {6,7,8}
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>YuJudge</title>
    <script src="https://cdn.jsdelivr.net/npm/react@16.13.1/umd/react.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom@16.13.1/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-router@5.2.0/umd/react-router.min.js"></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### 如何编写

了解了 plugin 的核心思想之后，下面介绍如何编写一个 plugin。

#### 基本流程

plugin 的编写比 loader 复杂的多， 一个 plugin 的基本代码结构如下所示：

```javascript {5}
class XXXXXXWebpackPlugin {
  constructor() {
  }

  apply(compiler) {
    // TODO: 你的业务逻辑
  }
}

module.exports = XXXXXXWebpackPlugin;
```

定义的 `apply` 方法是我们的核心，它可以接收一个 **webpack compiler** 对象的引用，从而可以在回调函数中访问到 **compiler** 对象。

我们前面提到，我们的 plugin 是基于 html-webpack-plugin 的，所以`constructorz` 中需要传入 html-webpack-plugin 的实例， 以及用户的 CDN 配置：

```typescript
constructor(htmlWebpackPlugin: HtmlExternalsWebpackPlugin, scriptSources: string[]) {
    // TODO: 你的业务逻辑
    this.htmlWebpackPlugin = htmlWebpackPlugin;
    this.scriptSources = scriptSources;
}

apply(compiler: Compiler) {
    // TODO: 你的业务逻辑
}
```

用户传入的是一个字符串数组，里面包含了一个或者多个 CDN 链接， 我们要将它转成 **html-webpack-plugin** 能够识别的格式， 查看其源码，我们可以得到以下的数据结构，这表示**一个HTML标签**：

```typescript
interface HtmlTag {
  // 标签元素
  attributes: {
    [attributeName: string]: string | boolean;
  };

  // 标签名称
  tagName: string;

  // 标签内部的 HTML (可选)
  innerHTML?: string;

  // 是否为空标签
  voidTag: boolean;
}
```

我们可以实现一个方法 `generateTags`，它传入用户提供的 CDN 字符串数组，然后转换成上面的数据结构：

```typescript
class HtmlExternalsWebpackPlugin {
  generateTags(scriptSources: string[]): HtmlTag[] {
    return scriptSources.map((res) => {
      return {
        tagName: 'script',
        voidTag: false,
        attributes: {
          "src": res,
        }
      };
    });
  }
}
```

然后我们完成 `apply` 方法，具体内容请看注释：

```typescript
class HtmlExternalsWebpackPlugin {
  htmlWebpackPlugin: HtmlExternalsWebpackPlugin | null = null;
  scriptSources: string[] = [];

  constructor(htmlWebpackPlugin: HtmlExternalsWebpackPlugin, scriptSources: string[]) {
    // 构造函数中传入 htmlWebpackPlugin 和用户配置 scriptSources
    this.htmlWebpackPlugin = htmlWebpackPlugin;
    this.scriptSources = scriptSources;
  }

  // 生成标签函数，上面已经提到过
  generateTags(scriptSources: string[]): HtmlTag[] {
    return scriptSources.map((res) => {
      return {
        tagName: 'script',
        voidTag: false,
        attributes: {
          "src": res,
        }
      };
    });
  }

  // apply 方法
  apply(compiler: Compiler) {
    // 在 compiler 中的 compilation hook 执行，拿到 compilation 对象。 我们之前提到过， html-webpack-plugin 通过 compilation 来匹配对应的自定义 hook
    compiler.hooks.compilation.tap('htmlExternalsWebpackPlugin', compilation => {
      if (this.htmlWebpackPlugin) {
        // @ts-ignore

        // 拿到 htmlWebpackPlugin 的自定义 hook
        const hooks = this.htmlWebpackPlugin.getHooks(compilation);

        // 在 alterAssetTagGroups 阶段 添加标签
        hooks.alterAssetTagGroups.tap('htmlExternalsWebpackPlugin', (assets: Assets) => {
          assets.headTags = [...this.generateTags(this.scriptSources), ...assets.headTags];
        });
      }
    });
  }
}
```

至此，这个 plugin 编写完成，其实只要理解了流程，编写难度也不算大，源码请参阅 [Github](https://github.com/yuzhanglong/html-externals-webpack-plugin)。


## 参考资料

- webpack 官网：https://webpack.js.org

- 干货！撸一个webpack插件：https://juejin.cn/post/6844903713312604173