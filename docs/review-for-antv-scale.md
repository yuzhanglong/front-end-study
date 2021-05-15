---
date: 2021-5-5

tags:

- 项目复盘
---

# yzl 的项目复盘 - @antv/scale

[[toc]]

## 介绍

自学前端也快一年了，最近想把自己之前做的项目好好复盘一下，一是为了技术的沉淀，二是为了和面试官更好地交(chui)流(bi)。

四月初加入了蚂蚁金服的 **antv** github 开源组织（有大腿抱，太爽哈哈），参与知名前端可视化项目 **G2** 的开发，我的第一个任务是做它的一个底层依赖 **@antv/scale**，主要处理数据映射相关的逻辑。

[![repo](http://cdn.yuzzl.top/blog/20210505152816.svg)](https://github.com/antvis/scale)



Scale 是数据可视化中的重要概念，它其实就是将数据映射到 0 ~ 1 的范围，方便进行视觉的映射、图形的绘制。

打个比方，给定一个定义域 **[0, 1]**，我们可以通过 `y = x` **线性映射**到值域：

![](http://cdn.yuzzl.top/blog/20210505135910.png)

也可以通过 `y = log(x)` 映射到值域：

![](http://cdn.yuzzl.top/blog/20210505135832.png)

本次开发主要是对之前的版本进行重构（几乎是重写了），主要原因如下：

- 旧版的 scale **bug 很多**。
- 旧版的性能差，事实证明，做缓存、提高复用性就可以提升性能近 10 倍（后面会详细分析）。
- github 虽然已经有轮子 `d3-scale` ，这个库非常优秀，经过时间的考验。但是代码的可读性太差，不方便添加功能，而且 pr 响应慢（指导我的前辈给他提了好几个 pr 解决了一些问题都没有回复）
- 旧版 **antv/scale** 支持的 scale 较少。

新版的目标如下：

- 重写所有的 scale，并添加更多的 scale。
- 代码重构，提高可读性、维护性。
- 性能提升。
- 单元测试尽可能 100%。

## 代码设计

### 总述

- 采用 typescript 开发
- 实现一个或多个 scale 的抽象基类（线性、离散），方便继承和统一 API
- 之后每一个 scale 都继承或间接继承该基类
- 上层封装要优雅，让具体 scale 的实现优雅便捷

### 基本映射过程

首先我们先介绍一下基本的映射过程，为后面的内容打好基础：

我们假设定义域为 **[0, 100]**，值域为 **[0, 100]**，映射方案为 **y = x2**

具体流程如下：

**map(25)**

- 将 **25** 通过函数表达式映射到值 **625**
- 将定义域的最大最小值通过函数映射到 **[0, 10000]**，这是新的值域
- 将 **[0, 10000]** 进行线性变换到 **[0, 1]** 区间上(插值 625)，并获得 625 在其中的比例 **0.0625**
- 将 **0.0625** 映射到给定的值域上，得到 **6.25**

**invert(6.25)**

- 由上一个案例可得反向映射的方案为 **y = sqrt(x)**
- 将 **6.25** 通过该函数映射到 **2.5**
- 将值域的最大最小值通过函数映射到 **[0, sqrt(100)]** 插值 2.5
- 将该值域线性变换到 **[0, 1]** 上

### 优雅地实现映射

#### 连续映射最佳实践

不难看出，上面的映射过程步骤还是很多的！实际的业务中还会在中间执行一系列操作（例如 round -- 四舍五入，clamp -- 裁剪越界），所以维护一个优雅的映射流程就成了重中之重。

还是拿上面的 `map` 为例，我们传入的 **25** 经历了什么？

抛开别的额外分支选项，基本的过程如下：

- 第一步，将它传入到了我们的函数表达式 **y = x2** (由用户传入)

```javascript
function pow2(x){
  return x * x;
}
```

- 第二步，将第一步得到的值进行了一次线性变换，变换的函数如下：

```javascript
function mapFromZeroToOne(x){
  // 由上面的例子可以得到比例关系：
  // => (res - 0) / (1 - 0) = (625 - 0) / (10000 - 0)  
  // => res / 1 = (625 / 10000) => x = 0.0625
	return x / 10000
}
```

- 第三步，再次进行了一次线性变换，从 **[0, 1]**(插值 0.0625)  映射到了值域 **[0, 100]**

````javascript
function mapToRange(x){
  // 类似于上面的比例关系
  // 0.0625 = res / 100 => res = 6.25
	return x * 100
}
````

从这三步，我们不难看出一个 x 经历了三次函数的调用：

```javascript
// realResult -- 用户获得的最终的结果
const realResult = mapToRange(mapFromZeroToOne(pow2(x)))
```

ok，到这一步，看看这行代码，你应该明白这是个啥了 -- **函数合成(compose)**。

让我们来整理一下上面的代码

```javascript
function pow2(x) {
  return x * x
}

function mapFromZeroToOne(x){
  return x / 10000
}

function mapToRange(x){
  return x * 100
}
```

写一个 `compose()` 函数来将函数们连起来，前一个函数的**返回值**将成为后一个函数的**参数**。

```javascript
function compose(fns) {
  return fns.reduce((preFn, currentFn) => {
    return (x) => currentFn(preFn(x))
  })
}
```

尝试一下：

```javascript
compose(pow2, mapFromZeroToOne, mapToRange)(25)
// 6.25
```

:::tip

`compose()` 的**函数合成**方案在很多库里面都有体现，例如 **redux** 的中间件调用、**webpack** 的 loader 调用。

:::

#### 映射函数复用 -- 函数 curry 化

上面的步骤非常优雅，但是有个问题，我们上面的三个函数都是写死的，里面的 **1000**， **10000**， **x * x** 都是固定的算法，实际上，这些参数都来自**定义域与值域**、**等其它的用户的个性化配置**，例如，我们不一定是 x 的平方，可以是 **x 的三次方**、**sqrt(x)**等等。

于是我们可以设计一个函数，传入必要的参数，然后返回另一个函数，对上面的三个函数优化如下：

```javascript
function powByExponent(exponent) {
  return (x) => {
    return Math.pow(x, exponent)
  }
}

function mapFromZeroToOne(start, end) {
  return (x) => {
    return (x - start) / (end - start)
  }
}

function mapToRange(start, end) {
  return (x) => {
    return x * (end - start) + start
  }
}

function compose(...fns) {
  return fns.reduce((preFn, currentFn) => {
    return (x) => currentFn(preFn(x))
  })
}


// 二次方
const fn1 = powByExponent(2)

// 线性变换到 [0, 1] 区间
const fn2 = mapFromZeroToOne(0, 100 * 100)

// 线性变换到用户给定的值域
const fn3 = mapToRange(0, 100)

compose(fn1, fn2, fn3)(25) // 6.25
```

这样，所有的核心逻辑都被放在了 base 基类！我们继承类的工作就根据用户的配置生成函数就行了！

### scale 的扩展

另外我们还扩展了一些 scale，它们都很实用，下面我挑出几个有趣的分享一下：

#### band

和上面介绍的 scale 不同，band 不是线性的，而是离散的，用户可以可选地传递一个内边距和一个外边距、对齐方案来构造 band，如下图：

```plain
PO = paddingOuter
PI = paddingInner
align = 0.5

domain = [A, B]

|<------------------------------------------- range ------------------------------------------->|
|             |                   |             |                   |             |             |
|<--step*PO-->|<----bandWidth---->|<--step*PI-->|<----bandWidth---->|<--step*PI-->|<--step*PO-->|
|             | ***************** |             | ***************** |             |             |
|             | ******* A ******* |             | ******* B ******* |             |             |
|             | ***************** |             | ***************** |             |             |
|             |<--------------step------------->|                                               |
|-----------------------------------------------------------------------------------------------|
```

它常用来处理柱状图柱子之间的距离，某些需求可能要自定义柱子之间的距离，或者自定义边距，如下图（把下面的 A B C 看成柱状图的柱子）

![](http://cdn.yuzzl.top/blog/20210505154416.png)

### Quantize

你知道 github 底部的 commit 记录吗，可以看出，不同的提交数对应了颜色的深浅，但是，提交数在某个较小的范围内颜色又是一样的，此类特性就和这个比例尺息息相关：

![](http://cdn.yuzzl.top/blog/20210505155549.png)

**Quantize** 要求你传入一个连续的定义域和一个离散的值域，例如：

```javascript
// 用户今年的提交数的最小值为 0，最大值为 100
let domain = [0, 100]

// 这里用中文描述了，为了方便感受。实际上对应了是十六进制的颜色值
let range = ["浅绿", "较浅绿", "绿", "较深绿", "深绿"]

// 为用户的提交次数作出映射
map(1) // 浅绿
map(2) // 浅绿
map(10) // 浅绿
map(18) // 浅绿
map(20) // 较浅绿
map(40) // 绿
map(60) // 较深绿
map(80) // 深绿
```

可以看出，用户不同的 commit 数据会**按照所在的区间**映射到对应的颜色，我们可以通过映射出来的颜色来配置样式。

### 性能优化

作为一个底层库，性能优化必不可少。

#### 尽可能使用定长数组、下标赋值

对于确定长度的数组不用 push 赋值，而是初始化一个定长的数组，然后通过下标的方式来赋值。

因为动态数组的 push 操作涉及重新申请内存，对性能有影响。

> v8 源码显示，如果初始化一个空数组，初始容量为 4，当 push 第五个时，容量将变成原来的一点五倍并加上 16，然后重新申请一块如此大小的内存，再把原来的数据拷贝进去。

#### 尽量使用 for 循环，不使用高阶函数迭代

事实证明，for 循环迭代比 map **快 8 倍**左右，这对性能影响非常大，原因是 js 底层的 for 循环是使用汇编编写的，而 `map()`、`forEach()` 是采用 js 编写的。

#### 尽可能减少 new 带来的开销

scale 有一个 `update()` 方法，让你传入一个新的配置，然后更新数据。

现在已知某个模块需要维护一个 `Map` ，0每一次初始化这个模块、更新这个模块（`update()`）的时候都会将这个 `Map` 重置，然后重新赋值。对此，我们要尽可能地利用它，正确的做法应该是调用原来的 `map.clear()` 方法，然后重新赋值。

事实证明，尽可能的使用**缓存**可以让性能提高 10 倍左右。

另外，某个部分的逻辑是这样的：我们要写一个新的模块，可以采用继承的方式，也可以采用聚合的方式，但采用聚合的方式性能会慢好几倍（上万次 update 之后，性能有质的变化），这是因为后者比前者多 new 了一次，但是，后者的代码可读性比前者要略差一点。 当然，个人拙见，全部采用函数闭包的性能应该是最好的。

#### 不过早进行复杂的计算

不要过早进行复杂的计算，上面说到，某些逻辑会初始化一个 map，你可以放在 `constructor` 初始化，也可以在用户调用 `map` 的时候初始化，但还是不要过早地进行复杂的计算，只在**有必要的时候**进行。

### 一些 fixed 的小 bug

#### 经典的 0.1 + 0.2 !== 0.3 的问题

一个遗留了一年的 issue：https://github.com/antvis/scale/issues/53

解决的 pr：https://github.com/antvis/scale/pull/117/files

这个 bug 产生的原因在于前辈们的旧代码对 `0.1 + 0.2 !== 0.3` 的问题处理失误，解决这个问题有一些方法，旧代码的方法是使用 `toFixed(number)` 来裁剪精度，导致 `[0.25, 0.5, 0.75]` 变成了 `[0.3, 0.5, 0.8]`（数字处理没问题，关键是精度导致了间隔不对）。

正确的解决方案：

```typescript
function digitLength(num: number) {
  // Get digit length of e
  const eSplit = num.toString().split(/[eE]/);
  const len = (eSplit[0].split('.')[1] || '').length - +(eSplit[1] || 0);
  return len > 0 ? len : 0;
}

/**
 * 高精度加法，解决 0.1 + 0.2 !== 0.3 的经典问题
 *
 * @param num1 加数
 * @param num2 被加数
 * @return {number} 返回值
 */
export function precisionAdd(num1: number, num2: number) {
  const num1Digits = digitLength(num1);
  const num2Digits = digitLength(num2);
  const baseNum = 10 ** Math.max(num1Digits, num2Digits);
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}
```

## 工程规范

commitlint、lint-staged 之类的我就不多说了，这里提几个有趣的：

### 使用 squash 来 merge 分支

squash 的本质是 rebase，rebase 可以为我们提供一套清晰的代码历史。

![](http://cdn.yuzzl.top/blog/20210505192307.png)

### benchmark 测试保证性能优化

上面所说的性能优化必须得到保证，这里我们使用 **benchmark** 进行测试，通过设置合适的基准数（可以理解为性能优化的倍数），一旦因为某些代码的改动导致原来优化的性能下降，ci 将无法通过，确保及时发现问题。

一个使用案例：

```typescript
// 使用 promise 对 benchmark 库进行封装
import Benchmark from 'benchmark';

interface BenchMarkBetweenOptions {
  // 回调函数 1
  cb1: Function;
  // 回调函数 2
  cb2: Function;
  // 期望的倍率，默认为 1
  magnification?: number;
  // 执行断言
  check?: boolean;
}

/**
 * benchMark 两个回调函数, 并为倍率进行断言
 * 由于本库经常要和 d3 进行性能优化，故添加了这个工具函数
 *
 * @param opt 相关选项，请参考定义
 * @see BenchMarkBetweenOptions
 */
export const benchMarkBetween = async (opt: BenchMarkBetweenOptions) => {
  const { check, magnification, cb1, cb2 } = opt;

  return new Promise((resolve) => {
    // test env, do not use browser to prevent bugs
    Benchmark.support.browser = false;
    const suite = new Benchmark.Suite();

    suite
      .add(cb1.name || 'first', () => {
        cb1();
      })
      .add(cb2.name || 'second', () => {
        cb2();
      })
      // add listeners
      .on('cycle', (event) => {
        console.log(String(event.target));
      })
      .on('complete', function complete() {
        const first = this[0];
        const second = this[1];
        if (check) {
          expect(first.hz / magnification || 5).toBeGreaterThan(second.hz);
        }
        resolve({
          first,
          second,
        });
      });
    suite.run();
  });
};

// 测试文件

import * as d3 from 'd3-scale';
import { Band } from '../src';
import { benchMarkBetween } from './benchmark';

describe('band perf test', () => {
  test('100000 map and update call, antv is eight times faster than d3', async () => {
    const domain = new Array(10000).fill('').map((item, index) => index);

    const antvTest = () => {
      const antvScale = new Band({
        domain,
        range: [0, 100000],
      });

      for (let i = 0; i < 100000; i += 1) {
        antvScale.map(i);
        if (i % 1000 === 0) {
          antvScale.update({
            domain: [0, 100000],
            range: [0, 100000],
          });
        }
      }
    };

    const d3Test = () => {
      const d3Scale = d3.scaleBand().domain(domain).range([0, 100000]);
      for (let i = 0; i < 100000; i += 1) {
        d3Scale(i);
        if (i % 1000 === 0) {
          d3Scale.domain(domain).range([0, 100000]);
        }
      }
    };
    // antv 比 d3 快 8 倍
    await benchMarkBetween({
      cb1: antvTest,
      cb2: d3Test,
      magnification: 8,
      check: true,
    });
  });
});
```

