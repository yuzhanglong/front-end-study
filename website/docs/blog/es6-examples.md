# 一些有趣的ES6案例分析

## Symbol

### React 利用 Symbol 防止 XSS 攻击

我们都知道，React 元素是一个 `plain object`:

```javascript
let el = {
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

如果你的服务器有允许用户存储任意 JSON 对象的漏洞，而前端需要一个字符串，这可能会发生一个问题：

```javascript
// 服务端允许用户存储 JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: 'dangerous InnerHTML'
    },
  },
  // ...
};
let message = {text: expectedTextButGotJSON};
```

然后在某段JSX中使用了它，攻击者就可以运行我们不期望的 html 代码：

```jsx
// React 0.13 中有风险
<p>
  {message.text}
</p>
```

但是React在之后的版本中使用了 `Symbol` 标记React元素：

```javascript
let el = {
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

因为JSON不支持 `Symbol` 类型。所以即使服务器存在用JSON作为文本返回安全漏洞，JSON 里也不包含 `Symbol.for('react.element')`。React 会检测 `element.$$typeof`
，如果元素丢失或者无效，会**拒绝处理**该元素。

### vue-router-next 利用 Symbol 防止属性污染

vue-router 利用 `app.provide` 这个API，将 `routerKey` 等全局对象挂载到全局 `vue` 实例上： 为了防止属性污染，`key` 值在这里被设置为一个 `Symbol`：

```typescript
// PolySymbol 返回一个合适的 Symbol 如果浏览器环境不支持，则直接返回一个字符串
export const PolySymbol = (name: string) =>
  hasSymbol
    ? Symbol(__DEV__ ? '[vue-router]: ' + name : name)
    : (__DEV__ ? '[vue-router]: ' : '_vr_') + name

export const routerKey = /*#__PURE__*/ PolySymbol(
  __DEV__ ? 'router' : 'r'
) as InjectionKey<Router>

app.provide(routerKey, router)
app.provide(routeLocationKey, reactive(reactiveRoute))
app.provide(routerViewLocationKey, currentRoute)
```

vue-router 的其他模块就可以通过 `routerKey` 优雅地拿到全局 `router` 对象，其中 `inject()` 方法是 `vue` 取得全局对象属性的 API。

```typescript
setup = () => {
  const link = reactive(useLink(props))
  const {options} = inject(routerKey)!
  // 省略其他内容
}
```

## Set 和 Map 数据结构

### 优雅地实现数组/字符串去重

基于集合没有重复元素的特点，我们可以优雅地实现**数组去重**，来看下面代码：

```javascript
let myArr = [1, 1, 2, 3, 5];
let uniqueElementsArr = [...new Set(myArr)];
console.log(uniqueElementsArr);
// [1, 2, 3, 5]
```

或是去除字符串里面的重复字符：

```javascript
let myStr = "hello world!";
let newStr = [...new Set(myStr)];
console.log(newStr.join(""));
// "helo wrd!"
```

### 利用 weakMap 防止内存泄露

来看下面的例子，下面的 `e1` 和 `e2` 是两个对象，我们通过 `arr` 数组对这两个对象添加一些文字说明。这就形成了 `arr` 对 `e1` 和 `e2` 的引用。

```javascript
const e1 = document.getElementById('foo');
const e2 = document.getElementById('bar');
const arr = [
  [e1, 'foo 元素'],
  [e2, 'bar 元素'],
];
```

如果我们不需要 `e1` 和 `e2`，就必须手动解除引用，此类代码很容易被开发者遗忘：

```javascript
arr [0] = null;
arr [1] = null;
```

使用 `weakmap` 就可以规避这种麻烦：

```javascript
const wm = new WeakMap();

const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element);
```

