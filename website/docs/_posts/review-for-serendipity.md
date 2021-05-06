---
date: 2021-5-6

tags:

- 项目复盘

---

# yzl 的项目复盘 - serendipity

## 介绍

### 综述

Serendipity 是一个插件化的前端脚手架工具。 你可以通过添加 **plugin** 快速初始化一个项目(例如 `webpack` + `React`)，或者初始化一些开箱即用的配置 ( 如 `eslint`、`GitHub actions` 等)。

### 为什么是

这个脚手架的出现有如下的考虑因素：

- 个人能力提升 -- 会写脚手架是一个热爱前端工程化者的基本能力。
- 初级原因（刚开始的想法，结果拖了后腿，到时候说） -- **create react app** 的弊端 ，它不能合入 **webpack 配置**。
- 额外的原因补充（导致一次彻底的重构）-- **前端开发模板（非 webpack 封装）**。在我平时写一个 demo 项目时，经常需要复制粘贴一些模板化的配置文件，例如 **webpack.config.js**、**jest.config.js**、**eslintrc.js**、**tsconfig.json**... 总是去之前的项目中复制粘贴效果太差，于是我把这个项目进行了一次重构。

### create-react-app

- CRA 挺不错，但是扩展性极差是个一直被诟病的点，于是有了 **create-react-app-rewire** 这种库，另外一款脚手架 **vue-cli** 扩展性就很不错，可以开箱即用，也可以进行自定义配置。
- webpack 的配置相对落后，有一些旧配置在新的 webpack 版本已经弃用。

### vue-cli

- 优雅的插件架构，可以模仿学习（但是不能一味模仿，后面会提到这个弊端）
- vue-cli 的架构对**单一应用（只是 vue 或者只是 react）**的架构非常合适，但是对一个面向多应用的脚手架（我的诉求），有点捉襟见肘，下面会提到。

### 架构设计

#### 多包开发

多包开发的最佳实践是使用 `lerna` 这个多包管理工具进行开发，具体使用不是本文需要阐述的。

#### 第一版

第一版的设计目的是为了处理 **create-react-app** 的弊端开发的一个脚手架，当时，我的设计是这个脚手架可以支持 vue 和 react 的项目开发。

于是架构便如此设计（类似于 vue）：

- 一个 **cli** 包，用来接收命令行命令。
- 多个 **service** 包（vue-service，react-service）。
- 多个 **plugin** 包（eslint-plugin）。
- 通过 cli 的命令选择**对应的 service**。
- 每个 **service** 和 **plugin** 都有一个 **generator**，保存了模板，其中，service 的模版是项目的核心，其它 plugin 的模板是通过修改 service 模板得到的。

实际上，第一版的架构是基于单框架的脚手架，对于要支持多个框架的脚手架就不方便了：

- 每一个框架的工具链从 cli -- serivce -- 一个或者多个 plugin，跨了至少三个包。（不是完整的插件化，最终还隔了一个 service）
- service 层无法复用， 针对不同的框架必须写额外的 service。
- **plugin** 的**可复用性极差**（面向多个 service），如果我已经有 vue 了，也有对应的 eslint plugin 了，但是如果我添加了 react 支持，那么 react 必须又搞一个 eslint plugin，那就必须重新开一个包。
- 难以实现仅拷贝项目模板的需求。

#### 第二版

第二版我的架构是完全的插件化架构（不再有 service 层）。

实际上，一个脚手架主要有以下作用：

- 基于命令行**拷贝**代码（Template 模式）
- 生成的项目可以有一些**启动**（Runtime 模式）的 scripts，用来启动 webpack、或者测试等功能。这个功能可有可无

所以一个插件应该具有以下能力：

- 插件可以向外界暴露一个或者多个命令，一个命令对应了插件内部封装的一个脚本（webpack build、webpack dev serve）
- 插件应该提供一个或者多个模板。
- 插件可以直接或者间接地向用户发起质询，通过质询，选择合适的模板、选择合适的命令行。
- **插件之间**可以自由交互。

另外，还有一些其它的修改：

- cli 只负责命令行(cli)，再开一个核心包（cli-core）用来调度插件、拷贝模板（NodeJS API）

#### 第二版插件的解决方案

插件的基本功能已经列出，现在就是核心模块如何去处理插件了。

##### 回调函数方案

首先我们想到的是**回调函数方案**，大致的能力代码如下：

```javascript
module.exports = (coreAPI) => {
  return {
    // 脚本，plugin 可以封装一些功能，它的每一个 key 会被 cli 核心模块写入新的 package.json 中
    scripts: {
      serve: () => {
        // 执行相应的 webpack 操作
      },
      build: () => {
        // 执行相应的 webpack 操作
      }
    },

    // 模板，
    template: (info) => {
      if (!info.tsSupport) {
        // 可以在质询的数据中拿到用户的回答，渲染不同的模板
        coreAPI.renderTemplate('react-app')
      } else {
        coreAPI.renderTemplate('react-app-ts')
      }
    },

    inquiry: [
      {
        question: '你需要 ts 支持吗',
        default: true,
        key: 'tsSupport'
      }
    ]
  }
}
```

##### 装饰器方案

装饰器的方案其实非常优雅，代码可读性大大增加，避免了回调函数模式的嵌套，缺点是必须使用 typescript 开发：

```typescript
import { Construction, Inquiry, Runtime, Script, SerendipityPlugin } from '@attachments/serendipity-scripts'
import { ConstructionOptions, RuntimeOptions } from '@attachments/serendipity-scripts'


@SerendipityPlugin('my-plugin')
class MyPlugin {
  @Construction()
  myConstruction(options: ConstructionOptions) {
    // 在构建模式下做些什么
  }

  @Runtime()
  myRuntime(options: RuntimeOptions) {
    // 在 runtime 模式下做些什么
  }

  @Inquiry()
  myInquiry() {
    // 发起质询
    return []
  }

  @Script('hello-world')
  myScript() {
    // 在用户执行 serendipity-scripts hello-world 之后 做些什么
  }
}

export default MyPlugin
```

- 代码更加优雅，方法名可以随意，只要打上相应的注解，就会在合适的时候运行
- 如果有多个方法打上了注解，他们会按顺序执行，拆分逻辑，例如一个 eslint 插件，可以给 react 添加额外的配置，可以给 vue 添加额外的配置，也可以添加一些公共的配置。
- 命令行模式非常清晰，cli 核心会去寻找打有 **script** 注解的方法，然后将此方法合并到 `package.json` 中：

```json
{
  "scripts": {
    "react-start": "serendipity-scripts run hello-world"
  }
}
```

- 对于**纯 template 的项目**，我们会根据注解判断，然后删除对应的 plugin。

##### ts 装饰器原理

**Reflect Metadata** 是 ES7 的一个**提案**，它主要用来在声明的时候**添加和读取元数据**。TypeScript 在 1.5+ 的版本已经支持它，我们需要 **reflect-metadata** 这个库来实现，装饰器的具体使用我不介绍，这里只讲一下原理：

来看下面的代码：

```typescript
class Foo {
  @Construction()
  mergeBabelConfigInfoPackage(options: ConstructionOptions) {
    // TODO
  }
}
```

typescript 将会把它编译成：

```typescript
__decorate([
  serendipity_core_1.Construction(),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object]),
  __metadata("design:returntype", void 0)
], SerendipityBabelPlugin.prototype, "mergeBabelConfigInfoPackage", null);
exports.default = SerendipityBabelPlugin;
```

不难看出：

- 调用装饰器实际上是调用 `__decorate()` 方法。
- 第一个参数是个数组，保存了装饰器的一些信息，例如装饰器**对应的函数**、类型、返回值、参数等。
- 第二个参数是被装饰的类的原型
- 第三个参数是被装饰的方法的名称（字符串）

- 调用 decorate 的本质是调用 `Reflect.decorate()`(由 reflect-metadata 提供，原生 js 没有此方法)，这个方法除去一些边界值的判断、报出异常，最终调用了一个 `DecorateProperty(decorators, target, propertyKey, attributes)` 方法。

`DecorateProperty` 方法代码如下：

```javascript
function DecorateProperty(decorators, target, propertyKey, descriptor) {
  for (var i = decorators.length - 1; i >= 0; --i) {
    var decorator = decorators[i];
    var decorated = decorator(target, propertyKey, descriptor);
    if (!IsUndefined(decorated) && !IsNull(decorated)) {
      if (!IsObject(decorated))
        throw new TypeError();
      descriptor = decorated;
    }
  }
  return descriptor;
}
```

我们最终执行了 decorator 函数，并以当前的类、对应的 method 名称等参数作为参数传入。

而我们的装饰器函数如下所示：

```typescript
export const Runtime = () => {
  return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PLUGIN_RUNTIME_META_KEY, true, descriptor.value)
  }
}
```

所以我们最终执行了 defineMetadata，他最终会将一系列参数放到一个全局的 `WeakMap()` 中，以配置的 meta key 为键，：

```javascript
 function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
  var metadataMap = GetOrCreateMetadataMap(O, P, true);
  metadataMap.set(MetadataKey, MetadataValue);
}
```

```javascript
function GetOrCreateMetadataMap(O, P, Create) {
  var targetMetadata = Metadata.get(O);
  if (IsUndefined(targetMetadata)) {
    if (!Create)
      return undefined;
    targetMetadata = new _Map();
    Metadata.set(O, targetMetadata);
  }
  var metadataMap = targetMetadata.get(P);
  if (IsUndefined(metadataMap)) {
    if (!Create)
      return undefined;
    metadataMap = new _Map();
    targetMetadata.set(P, metadataMap);
  }
  return metadataMap;
}
```

不难看出，这里是一个 三层 map 的**嵌套**：

- 第一个 Map 是全局 Map，整个库维护了一个 `WeakMap()`
- 这个 Map 以基础元素（class）为键，以一个 **targetMetadata** 为值（也是个 Map）
- 新的 **targetMetadata（Map）** 以**被修饰的 property** 为键，一个存放具体数据的 **metadataMap** 为值
- **metadataMap** 保存了我们配置的 **metaKey** 和相应的 **value**（装饰器参数）

之后我们在获取装饰器信息的时候只需要按序查 **Map** 就可以了。

##### 多个插件如何合作

- 基于 webpack 的插件机制（原理不再赘述，核心思想是一种**高耦合的发布订阅模式**），每个插件可以在 `constructor` 中初始化 hooks，由于每个插件都会先被实例化，在实际的方法中就可以匹配对应的插件，然后做一些别的操作。

```typescript
class SerendipityBabelPlugin {
  /**
   * React 项目初始化，合并 babel-loader 配置
   *
   * @author yuzhanglong
   * @date 2021-2-24 00:23:25
   */
  @Runtime()
  initBabelForReactProject(options: RuntimeOptions) {
    const plugin = options.matchPlugin('serendipity-react-plugin')
    const instance: SerendipityReactPlugin = plugin.getPluginInstance() as SerendipityReactPlugin
    if (plugin && instance) {
      instance.reactServiceHooks.beforeWebpackStart.tap('webpackMerge', (mergeFn) => {
        mergeFn(SerendipityBabelPlugin.BASE_CONFIG)
      })
    }
  }

  /**
   * 将 babel 配置写入 package.json
   *
   * @author yuzhanglong
   * @date 2021-2-24 00:24:10
   */
  @Construction()
  mergeBabelConfigInfoPackage(options: ConstructionOptions) {
    options.appManager.packageManager.mergeIntoCurrent({
      'babel': {
        'presets': [
          '@babel/preset-react',
          '@babel/preset-typescript'
        ]
      }
    })
  }
}

export default SerendipityBabelPlugin
```

##### 预设机制

预设可以组织多个插件让它们协同工作。例如一个 React 项目我们需要添加 eslint 支持，那么可以有一个 `react plugin` + `eslint plugin` 的预设。

一个预设可以是一个返回预设对象的函数，或者一个预设对象。

下面的代码是一个预设对象文件案例，在脚手架运行时，`serendipity-plugin-react` 和 `serendipity-plugin-babel` 将会被安装：

```javascript
/*
 * File: reactApp.js
 * Description: react-app preset
 * Created: 2021-2-21 11:41:03
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

module.exports = {
  initialDir: true,
  initialDirDefaultName: 'hello-react',
  plugins: [
    {
      name: '@attachments/serendipity-plugin-react'
    },
    {
      name: '@attachments/serendipity-plugin-babel'
    }
  ]
}
```

下面是一个 typescript 项目的预设：

```javascript
module.exports = {
  initialDir: false,
  plugins: [
    {
      name: '@attachments/serendipity-plugin-eslint',
      removeAfterConstruction: true
    },
    {
      name: '@attachments/serendipity-plugin-typescript',
      removeAfterConstruction: true
    }
  ]
}
```

### 插件实现

#### react-plugin

react 插件的核心机制在于 webpack 的配置，开发过程中我参考了 create-react-app 的配置，主要有以下的核心机制：

- 一些基础配置，entry 、mode 、path 等等。

- 基于 **content hash** 来生成打包的文件名（根据文件内容生成文件名，可以提高打包文件复用率），**assetModuleFilename**（v5 新特性） 来处理静态文件。
- 对于懒加载，基于 **content hash** 生成相应的文件。
- 配置 **publicPath**，对于**部署在 CDN 上的项目**尤其有用。
- 开启 **splitChunks** 功能进行模块分割（抽离公共代码、懒加载）。
- 使用 [terser](https://github.com/terser-js/terser) 来压缩 JavaScript，基于 **TerserPlugin**。
- 使用 **OptimizeCSSAssetsPlugin** 压缩 css。
- 使用 **HtmlWebpackPlugin** 来生成初始的 html 模板。
- 使用 **BundleAnalyzerPlugin** 可视化分析打包结果。
- 使用官方的 **ReactRefreshWebpackPlugin** 实现 react 项目的热更新。
- 自己开发了一个 **SerendipityWebpackPlugin** 来进行控制台的输出。
- **ForkTsCheckerWebpackPlugin**，用于结合 webpack-dev-server 对 typescript 进行实时监测。
- **MiniCssExtractPlugin**，用来抽离 css 到单独的文件中。
- 配置 **loader**，值得注意的是，webpack5 内置了静态资源的处理方式，可以直接输出到文件、也可以返回路径 URL。
- 配置 **extensions** 让模块可以不带扩展名。

你也可以[到这里](https://github.com/yuzhanglong/serendipity/blob/main/packages/serendipity-plugin-react/src/webpack/webpackBase.ts)查看我的配置。。
