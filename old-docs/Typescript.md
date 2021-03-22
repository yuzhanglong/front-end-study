# Typescript

## 模块解析

### 模块解析策略

这种策略在以前是TypeScript默认的解析策略。 现在，它存在的理由主要是为了向后兼容。

#### Classic 模式

- 相对导入：寻找.ts和.d.ts。
- 非相对导入: **依次向上遍历**，依次寻找.ts和.d.ts。

#### Node 模式
相对模块：**module.ts/tsx/.d.ts** -> **package.json** -> **index.ts/tsx/.d.ts**
非相对模块：**[node_modules]/(.ts .tsx d.ts)** -> **package.json** ->  **index.ts/tsx/.d.ts**，并逐级向上寻找。

#### 额外策略

##### Base URL

 所有非相对模块导入都会被当做相对于 `baseUrl`。

##### 路径映射

来看下面的ts配置：

```json
{
  "compilerOptions": {
    "baseUrl": ".", // This must be specified if "paths" is.
    "paths": {
      "jquery": ["node_modules/jquery/dist/jquery"] // 此处映射是相对于"baseUrl"
    }
  }
}
```

##### 利用**rootDirs**指定虚拟目录

来看下面的目录：

```tree
src
 └── views
     └── view1.ts (imports './template1')
     └── view2.ts

 generated
 └── templates
         └── views
             └── template1.ts (imports './view2')
```

`src/views`里的文件是用于控制UI的用户代码。 `generated/templates`是UI模版，在构建时通过模版生成器自动生成。 构建中的一步会将 `/src/views`和`/generated/templates/views`的输出拷贝到同一个目录下。 在运行时，视图可以假设它的模版与它同在一个目录下，因此可以使用相对导入 `"./template"`。

可以使用`"rootDirs"`来告诉编译器。 `"rootDirs"`指定了一个*roots*列表，列表里的内容会在运行时被合并。 因此，针对这个例子， `tsconfig.json`如下：

```tree
{
  "compilerOptions": {
    "rootDirs": [
      "src/views",
      "generated/templates/views"
    ]
  }
}
```

##### 跟踪模块解析

来看下面的目录结构：

```tree
│   tsconfig.json
├───node_modules
│   └───typescript
│       └───lib
│               typescript.d.ts
└───src
        app.ts
```

我们可以使用`--traceResolution`调用编译器，来查看模块的查找情况：

```shell
======== Resolving module 'typescript' from 'src/app.ts'. ========
Module resolution kind is not specified, using 'NodeJs'.
Loading module 'typescript' from 'node_modules' folder.
File 'src/node_modules/typescript.ts' does not exist.
File 'src/node_modules/typescript.tsx' does not exist.
File 'src/node_modules/typescript.d.ts' does not exist.
File 'src/node_modules/typescript/package.json' does not exist.
File 'node_modules/typescript.ts' does not exist.
File 'node_modules/typescript.tsx' does not exist.
File 'node_modules/typescript.d.ts' does not exist.
Found 'package.json' at 'node_modules/typescript/package.json'.
'package.json' has 'types' field './lib/typescript.d.ts' that references 'node_modules/typescript/lib/typescript.d.ts'.
File 'node_modules/typescript/lib/typescript.d.ts' exist - use it as a module resolution result.
======== Module name 'typescript' was successfully resolved to 'node_modules/typescript/lib/typescript.d.ts'. ========
```

## type(类型别名) 和 interface

### 区别

- **interface**可以进行声明合并，**type**不可以。

![](http://cdn.yuzzl.top/blog/20201124205226.png)

- **type**不能被 `extends`和 `implements`（自己也不能 `extends`和 `implements`其它类型）。

- **type**支持**类型映射**，**interface**不可以。

![](http://cdn.yuzzl.top/blog/20201124211133.png)

- type可以用**typeof**关键字获取实例。

![](http://cdn.yuzzl.top/blog/20201124211546.png)

- type可以作用于原始值，联合类型，元组以及其它任何你需要手写的类型。

![](http://cdn.yuzzl.top/blog/20201124212624.png)