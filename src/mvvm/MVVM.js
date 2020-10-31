class Compiler {
  constructor(el, vm) {
    // 判断el属性是字符串还是元素,
    // 如果是字符串，我们通过它来获取元素
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;

    let fragment = this.nodeToFragment(this.el);
    this.compile(fragment);
    this.el.appendChild(fragment);
  }

  // 编译内存中的DOM节点
  compile(node) {
    let childNodes = node.childNodes;
    [...childNodes].forEach(child => {
      if (this.isElementNode(child)) {
        this.compileElement(child);
        this.compile(child);
      } else {
        this.compileText(child);
      }
    })
  }

  // 是否为指令 例如 v-xxx
  isDirective(attrName) {
    return attrName.startsWith('v-');
  }

  // 编译元素
  compileElement(node) {
    let attributes = node.attributes;
    [...attributes].forEach(attr => {
      let {name, value: expr} = attr;
      // 判断是不是指令
      if (this.isDirective(name)) {
        let [a, directive] = name.split("-");
        let [directiveName, eventName] = directive.split(":");
        CompileUtil[directiveName](node, expr, this.vm, eventName);
      }
    })
  }

  // 编译文本
  compileText(node) {
    let content = node.textContent;
    if (/\{\{(.+?)\}\}/.test(content)) {
      // 找到文本
      CompileUtil['text'](node, content, this.vm);
    }
  }

  // 是否为html元素节点
  isElementNode(node) {
    return node.nodeType === 1;
  }

  nodeToFragment(node) {
    let fragment = document.createDocumentFragment();
    let firstChild = node.firstChild;
    while (firstChild) {
      fragment.appendChild(firstChild);
      firstChild = node.firstChild;
    }
    return fragment;
  }
}

CompileUtil = {
  // 根据表达式取到对应的数据
  getValue(vm, expr) {
    return expr.split(".").reduce((data, current) => {
      return data[current];
    }, vm.$data);
  },

  setValue(vm, expr, value) {
    expr.split(".").reduce((data, current, index, arr) => {
      if (arr.length - 1 === index) {
        return data[current] = value;
      }
      return data[current];
    }, vm.$data);
  },

  // node 为节点 expr为表达式 vm为当前实例
  model(node, expr, vm) {
    let fn = this.updater['modelUpdater'];
    // 添加一个观察者, 如果将来数据发生更新，那么会拿新值给输入框赋值
    new Watcher(vm, expr, (newValue) => {
      fn(node, newValue);
    });
    node.addEventListener('input', (e) => {
      let value = e.target.value;
      this.setValue(vm, expr, value);
    })
    let value = this.getValue(vm, expr);
    fn(node, value);
  },
  html(node, expr, vm) {
    let fn = this.updater['htmlUpdater'];
    new Watcher(vm, expr, (newValue) => {
      fn(node, newValue);
    });
    let value = this.getValue(vm, expr);
    fn(node, value);
  },
  getContentValue(vm, expr) {
    // 遍历表达式 将内容重新替换成一个完整的内容
    return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getValue(vm, args[1]);
    })
  },

  on(node, expr, vm, eventName) {
    node.addEventListener(eventName, (e) => {
      vm[expr].call(vm, e);
    });
  },
  text(node, expr, vm) {
    let fn = this.updater['textUpdater'];
    let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      new Watcher(vm, args[1], () => {
        // 返回完整字符串
        let entireValue = this.getContentValue(vm, expr);
        fn(node, entireValue);
      });
      return this.getValue(vm, args[1]);
    });
    fn(node, content);
  },
  updater: {
    // 把数据插入到节点中
    modelUpdater(node, value) {
      node.value = value;
    },
    // 处理文本节点
    textUpdater(node, value) {
      node.textContent = value;
    },
    htmlUpdater(node, value) {
      node.innerHTML = value;
    }
  }
}

class Dep {
  constructor() {
    // 存放所有的观察者
    this.subs = [];
  }

  // 订阅 -- 添加观察者
  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}

Dep.target = null;

class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    this.oldValue = this.get();
  }

  get() {
    Dep.target = this;
    let value = CompileUtil.getValue(this.vm, this.expr);
    Dep.target = null;
    return value;
  }

  update() {
    let newValue = CompileUtil.getValue(this.vm, this.expr);
    if (newValue !== this.oldValue) {
      this.cb(newValue);
    }
  }
}

// 数据劫持
class Observer {
  constructor(data) {
    this.observer(data);
  }

  observer(data) {
    if (data && typeof data == "object") {
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          this.defineReactive(data, key, data[key]);
        }
      }
    }
  }

  defineReactive(obj, key, value) {
    this.observer(value);
    // 给每一个属性都加上一个具有发布订阅的功能
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      get: () => {
        // 创建watcher时 会取到对应的内容 watcher放到了全局上
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set: (newValue) => {
        if (value !== newValue) {
          // 如果赋值了新的对象，那么我们也要设置监听。
          this.observer(newValue);
          value = newValue;
          dep.notify();
        }
      }
    });
  }
}

class MVVM {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    let computed = options.computed;
    let methods = options.methods;
    if (this.$el) {
      // 数据使用Object.defineProperty来定义
      new Observer(this.$data);

      for (let key in computed) {
        Object.defineProperty(this.$data, key, {
          get: () => {
            return computed[key].call(this);
          }
        })
      }

      for (let key in methods) {
        Object.defineProperty(this, key, {
          get: () => {
            return methods[key];
          }
        })
      }
      this.proxy(this.$data);
      new Compiler(this.$el, this);
    }
  }

  // 代理
  proxy(data) {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        Object.defineProperty(this, key, {
          get() {
            return data[key];
          },
          set(value) {
            data[key] = value;
          }
        });
      }
    }
  }
}
