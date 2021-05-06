---
date: 2021-5-5

tags:

- 项目复盘
---

# yzl 的项目复盘 - Lint Markdown

## 介绍

**lint-md** 是检查中文 markdown 编写格式规范的工具，支持命令行和 node API，github **730+star**。

![](http://cdn.yuzzl.top/blog/20210505211545.svg)

本人参与了 **@lint-md/core** (核心 API)、**@lint-md/cli** (命令行工具)的 TypeScript 重构，**@lint-md/eslint-plugin** (eslint 插件)、**@lint-md/github-action(GitHub Action) **的开发。

这个项目是和他人一起合作开发的项目，当时这个项目只有一个核心模块和一个 cli 命令行，我搜到了这个库并使用了一段时间，期间觉得每次检验文档格式时都要敲一遍命令行，如果能够**所见即所得**，可视化查错就好了，于是开发了一个 eslint 插件，实现了linter 的 IDE 支持。之后帮助原作者使用 typescript 重构了**核心模块**和 **cli 模块**，开发了支持 github ci 的 **github action**。

这个项目（包含周边）有好几个，我选择有亮点的来分析讨论。

## 项目分析

### @lint-md/eslint-plugin

#### 为什么是？

- 核心项目只支持 **NodeJS API** 和**命令行调用**，体验不太好，无法所见即所得。
- 额外写别的 **IDE** 插件工作量大，并且 ide 插件开发的文档相对 eslint 并不是很友好。
- eslint 拥有丰富的生态 -- 有很多 IDE都对 eslint 做了可视化的支持，并且使用方便。
-  eslint 的插件机制很自由，便于扩展。
- 不改动旧 API。

#### 如何去适配基于 JavaScript 的 eslint？

eslint 的 plugin 有以下几个核心概念：

- parser
- processor
- rules

##### 第一个问题 -- 处理 parser

第一个问题是处理 parser，由于项目的特殊性，markdown parse 相关的操作都是在核心模块实现的，也就是说，这里的 parser 是无需再添加的（当然，实际上应该是基于 eslint 处理 parser，但是对此项目来说这会破坏核心模块的代码）

另外，不能让默认的 JavaScript parser 处理我们的 markdown 文件。

parser 的目标是把传入的要检测的文件传入，然后经过一系列操作生成抽象语法树。

前面已经说过，parser 我们不在这里处理，但是 eslint 必须要依赖它啊，于是我们写一个固定的 ast:

```typescript
/*
 * File: constants.ts
 * Description: 面向 md 文件的 eslint 自定义 parser
 * Created: 2021-3-8 21:40:24
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

module.exports = {
  // md parser，使用一个定死的 ast，将 code 传给 Literal 的 value，
  // 这样，我们可以在 自定义的 eslint-rule 中的 Literal() 拿到它，然后查错 / fix it
  parseForESLint(code) {
    return {
      ast: {
        type: 'Program',
        start: 0,
        end: 0,
        loc: {
          start: {
            line: 1,
            column: 0
          },
          end: {
            line: 1,
            column: 0
          }
        },
        range: [0, 0],
        body: [
          {
            'type': 'ExpressionStatement',
            'start': 0,
            'end': 1,
            'range': [
              0,
              1
            ],
            'expression': {
              'type': 'MarkdownNode',
              'start': 0,
              'end': 1,
              'range': [
                0,
                1
              ],
              'value': code,
              'raw': '1'
            }
          }
        ],
        tokens: [],
        comments: []
      }
    }
  }
}
```

生成的这个 AST 是**写死的**，只有一个节点，称为 **MarkdownNode**，这样，我们在写 rules 的时候，就可以利用这个节点拿到 markdown 文件，最终调用 core  模块的 API 就可以啦，一个比较巧妙的做法。



##### 处理 -- processor

其实 eslint 想到了处理 markdown 的问题，但是 processor 是为处理 markdown 里面的 js 代码块考虑的，我们这里的需求并不是如此，于是我们把内容全部传入，成功解决：

```typescript
module.exports = {
  processors: {
    '.md': {
      preprocess: function(text) {
        return [text]
      },
      postprocess: function(messages) {
        return messages.flat()
      },
      supportsAutofix: true
    }
  }
}
```

##### 规则 - rules

上面的一切都是为了合理的调用 lint-md API 处理 rules 而打的基础，下面是一个 rule 的 DEMO：

```javascript
/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update it's content execute "npm run sync-rules"
 *
 * Please refer to the lint-md documentation for details about this rule
 *
 * @created: Wed May 05 2021 
 * @rule: no-empty-code
 * @see: https://github.com/lint-md/lint-md
 */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@lint-md/core");
const FIXABLE = "code";
module.exports = {
    meta: {
        type: 'suggestion',
        fixable: FIXABLE
    },
    create(context) {
        const getFixer = (node) => {
            return FIXABLE ? {
                fix: (fixer) => {
                    const newMarkdown = core_1.fix(node.value);
                    return fixer.replaceTextRange([0, node.value.length - 1], newMarkdown);
                }
            } : {};
        };
        return {
            MarkdownNode(node) {
                if (node.value) {
                    const errors = core_1.lint(node.value);
                    const resultErr = errors.filter(e => e.type === 'no-empty-code');
                    for (let err of resultErr) {
                        const describe = core_1.getDescription(err.type);
                        context.report({
                            message: describe.message,
                            loc: {
                                start: err.start,
                                end: err.end
                            },
                            ...getFixer(node)
                        });
                    }
                }
            }
        };
    }
};
//# sourceMappingURL=rule-template.js.map
```

所有的 rule 文件由于步骤几乎相同，都是调用 lint-md 的 API，所以我们通过代码的自动生成来生成 rules，如果核心 API 添加了额外的 rules，那么我们到时候执行文件生成的脚本即可，无需额外的维护成本。

### @lint-md/github-action

#### 为什么是？

对于纯文档的项目，有时候我们不需要安装一些额外的依赖，直接执行文档 lint 命令即可，这样 ci 的效率会非常高，等于说不用 `npm install`，效率大大提升。

这个工作我本来以为很简单的，结果遇到了大坑。

#### github-action 机制

github 有一套 ci 服务，也支持用户自定义 action，值得注意的是，在执行用户的自定义 action 时，是以用户的 github 仓库为基础，目标仓库为目录执行 ci 的，也就是说，github 这边不会给你 npm install（毕竟是为了效率考虑），所以我们可能要上传 `node_modules` 目录。

但是上传 `node_modules` 目录到 git 其实是不太合适的：

![](http://cdn.yuzzl.top/blog/20210505222040.jpg)

最佳实践应该是使用 webpack 的打包工具来打包，但是在 node 环境下的 webpack 有很多坑：

- 核心库不应该被打包 -- 这个很容易，使用 webpack 的 external 选项 或者配置环境为 node （**externalsPresets** 选项）即可。
- require 问题，这个很有意思，lint-md 是支持用户在工作目录下传入一个配置文件来自定义规则的级别的：

```javascript
// lintmdrc.js
module.exports = {
  "excludeFiles": [],
  "rules": {
    "space-round-alphabet": 1
  }
}
```

于是我们的内部逻辑就必须使用 `require(path)` 语句来拿到这个配置文件，这个 require 的参数是由外部传入的参数（命令行）决定的！

#### webpack 的坑

但是 webpack 不知道 path 变量是可选的，实际上，webpack 自己维护了一套打包机制，它会尝试读取 path 的值 -- path 的值为空 -- 找不到模块 -- 自动标记成 **module-not-found**。

可以去 webpack 打包的结果看一下：

```javascript
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
```

不难看出：

- 每一个被打包的模块都有自己的 moduleId
- 有一个` __webpack_module_cache__` 用来缓存已经被加载的模块（是一个空 JavaScript 对象）
- 第一次读取模块，会将模块的内容放到这个对象里面。
- 第二次读取，则从 cache 里面读取。
- 到此结束了，可以看出并不支持 node.js 下的动态 require，这很麻烦。

我尝试过了一些方案，第一，写一个 webpack plugin，在注入` __webpack_require__` 这种样板代码时通过 webpack plugin 的钩子来修改此代码，可是经过调试发现 webpack 内部并没有暴露相关的 API。

于是我采用了第二种方法 -- 基于 webpack plugin 的标记  -- 替换。

#### 最终解决方案

此思路来自于 `tree-shaking` 机制的一个标记 `/*#__PURE__*/`用来标记一个函数没有副作用，于是我也学着它，来了个 `/*#__PURE_REQUIRE__*/` 表示： webpack 同学，这个标记后面的 require 请不要打包！保留它就行了：

```javascript
function requireExample() {
  // 动态require，添加标记，希望 webpack 不要把它纳入自己的模块机制中
  if (configPath.endsWith('.js')) {
    return /*#__PURE_REQUIRE__*/ require(`${configPath}`)
  }
  // 一般的 require
  const data = require('axios')
}


// 打包结果，只是一个实例，实际 webpack 打包的结果并不是这样
function requireExample() {
  if (configPath.endsWith('.js')) {
    return require(`${configPath}`)
  }
  // 一般的 require, webpack 打包处理
  const data = __webpack_require__(axios 的 moduleId)
}
```

**webpack** 并没有这种机制，webpack 看到 **require** 就会用它自己的 `__webpack_require__` 替换掉，我们可以这样想，如果我们在 webpack 替换之前，把它替换成一个别的函数，然后这个函数来调用 require 不就行了吗？

于是我们的打包结果成了这样：

```javascript
function __webpack_pure_require__(path){
  return require(path)
}

function requireExample() {
  if (configPath.endsWith('.js')) {
    // 调用我们自己的打包函数
    return __webpack_pure_require__(`${configPath}`)
  }
  // 一般的 require, webpack 打包处理
  const data = __webpack_require__(axios 的 moduleId)
}
```

这样就成功了！现在我们有两个问题：

- 如何将做过标记的 require 替换？
- 如何将 `__webpack_pure_require__` 这个函数注入到全局？

不难看出，这两个问题分别对应了 webpack 的 **loader 和 plugin** 的实现，当然，loader 也可以通过 plugin 来注入，所以目标非常明确了。

我发布了一个 npm 包 https://github.com/yuzhanglong/node-require-webpack-plugin 用来处理这个问题，来看看实现：

**loader 职责**

loader 使用**正则匹配**，接收每一个传入的 JavaScript 文件，查询是否存在相应的标记：

- 如果存在，则将它处理成 `__WEBPACK_PURE_REQUIRE__(path)`

```typescript
  
/**
 * 拼接 require 内容
 *
 * @param matcher 匹配成功后的匹配信息数组，其中每项内容如下：
 * - 匹配到的所有内容
 * - require 语句前内容
 * - PURE_REQUIRE__标记
 * - require 文本
 * - require 语句内包裹内容
 * - require 语句后内容 (常见的有分号)
 *
 * 例如： `/#__PURE_REQUIRE__/ require(foo)`
 * 将被处理成：`__WEBPACK_PURE_REQUIRE__(foo)`
 *
 * @author yuzhanglong
 * @date 2021-3-19 09:42:54
 */
const concatRequireString = (matcher: string[]) => {
  // [[return] [/*#__PURE_REQUIRE__*/] [require](['foo'])[;]]
  //     1                2               3         4     5
  if (matcher.length !== 6) {
    return matcher[0]
  }
  return `${matcher[1]} __WEBPACK_PURE_REQUIRE__(${matcher[4]})${matcher[5]}`
}

export default concatRequireString
```

```typescript
/*
 * File: require-loader.ts
 * Description: 处理 require 的 loader
 * Created: 2021-3-19 10:23:05
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import concatRequireString from './concat-require-string'

const PURE_REQUIRE_REGEX = /(.*)(\/\*#__PURE_REQUIRE__\*\/) (require)\((.*)\)(.*)/

module.exports = (source: string) => {
  const data = source.split('\n')
  for (let i = 0; i < data.length; i++) {
    const matcher = data[i].match(PURE_REQUIRE_REGEX)
    if (matcher) {
      data[i] = concatRequireString(matcher)
    }
  }
  return data.join('\n')
}
```

**plugin 职责**

plugin 用来注入我们的 `require` 代码到入口文件中，我们知道 webpack 有一些生命周期，到底该选择哪个生命周期 -- 肯定是**代码已经打包完成之后、即将写入文件之前**这个阶段执行，我们看看官网：

![](http://cdn.yuzzl.top/blog/20210505232050.png)



make 生命周期非常符合 -- 在完成编译之前执行，于是我们把公共代码注入：

```typescript
/*
 * File: require-plugin.ts
 * Description: require plugin
 * Created: 2021-3-19 10:22:01
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import { Compiler } from 'webpack'
import { RawSource } from 'webpack-sources'
import { addCompilerRules, createRules, getRequireContent } from './utils'


class NodeRequireWebpackPlugin {
  apply(compiler: Compiler) {
    // 添加所需的 webpack loader
    addCompilerRules(compiler, createRules())

    // make hooks, 在 compilation 结束之前执行
    compiler.hooks.make.tap('make', (compilation) => {
      // 处理资源的 hook
      compilation.hooks.processAssets.tap('processAssets', (assets) => {
        let keys = Object.keys(assets)
        keys.forEach(key => {
          if (key.endsWith('.js')) {
            let asset = assets[key]
            let content = getRequireContent(asset)
            assets[key] = new RawSource(content)
          }
        })
      })
    })
  }
}

export default NodeRequireWebpackPlugin
```

最后，来看看打包结果：

![](http://cdn.yuzzl.top/blog/20210505232244.png)

成功替换了：

![](http://cdn.yuzzl.top/blog/20210505232310.png)

大功告成！

#### @lint-md/cli

这个其实是最没难度的，用 commander 封装一下就可以了，但是我在做 `@lint-md/github-action` 复用到了它的一部分代码，要继承它的某一个对象，而这个包（我使用 typescript 重构之前）打包的结果是 es5，好家伙，终于在实际项目中遇到 es5 继承了，不多说，来一发复习下：

```javascript
function inherit(parent, child){
  let prototype = Object.create(parent.prototype);
  prototype.constructor = child;
  child.prototype = prototype;
}
```

