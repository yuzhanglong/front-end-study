# HTML/CSS

https://www.sitepoint.com/introduction-to-hardware-acceleration-css-animations/

## CSS 硬件加速

### 从两个对比案例开始

下面让我们来看一个动画效果，在该动画中包含了几个堆叠在一起的球并让它们沿相同路径移动。最简单的方式就是实时调整它们的 `left` 和 `top` 属性。

<p class="codepen" data-height="265" data-theme-id="light" data-default-tab="html,result" data-user="SitePoint" data-slug-hash="WQVxQQ" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Animating overlapping balls with top/left Properties">
  <span>See the Pen <a href="https://codepen.io/SitePoint/pen/WQVxQQ">
  Animating overlapping balls with top/left Properties</a> by SitePoint (<a href="https://codepen.io/SitePoint">@SitePoint</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>



我们知道，修改元素的高度/宽度等信息会发生回流（reflow），发生回流必然导致重绘（paint），这对浏览器性能影响极大，可以看下面的性能分析：

![](http://cdn.yuzzl.top/blog/20201121233547.png)

也可以通过 render

   工具查看，绿色的部分是发生重绘的部分：

![](http://cdn.yuzzl.top/blog/20201121234508.png)

为了解决这个问题，我们可以使用 CSS transform 中的 `translate()` 来替代 `top` 和 `left`：

<p class="codepen" data-height="265" data-theme-id="light" data-default-tab="html,result" data-user="SitePoint" data-slug-hash="OyKXyK" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Animating overlapping balls with CSS transforms">
  <span>See the Pen <a href="https://codepen.io/SitePoint/pen/OyKXyK">
  Animating overlapping balls with CSS transforms</a> by SitePoint (<a href="https://codepen.io/SitePoint">@SitePoint</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

![](http://cdn.yuzzl.top/blog/20201121234033.png)

![](http://cdn.yuzzl.top/blog/20201121234616.png)

可以看到执行过程中没有发生重绘。

### 发生的原因

为什么 **transform** 没有触发 **repaint** 呢？简而言之，transform 动画由**GPU 控制**，支持**硬件加速**，并不需要软件方面的渲染。

浏览器接收到页面文档后，会将文档中的标记语言解析为 DOM 树。DOM 树和 CSS 结合后形成浏览器构建页面的渲染树。渲染树中包含了大量的渲染元素，每一个渲染元素会被分到一个图层中，每个图层又会被加载到 GPU 形成渲染纹理，而图层在 GPU 中 `transform`
是不会触发 **repaint** 的，最终这些使用 `transform` 的图层都会由独立的合成器进程进行处理。CSS `transform` 创建了一个新的**复合图层**，可以被 GPU 直接用来执行 `transform`
操作，正如上图所示，黄色框线框出的动画主体就是一个复合图层 ，假设有一张背景图片在圆形物体下方 -- 第一种方案会导致背景的重绘，第二种就不会 -- 它是独立于一般图层的。

### 强制 GPU 渲染

为了避免 2D transform 动画在开始和结束时发生的 repaint 操作，我们可以硬编码一些样式来解决这个问题。

```css
.example1 {
  transform: translateZ(0);
}

.example2 {
  transform: rotateZ(360deg);
}
```

或者使用`will-change`（兼容性不太好）：

```scss
#target {
  will-change: transform;
}
```

## TODO

常见定位

水平垂直居中

若父级和子级没有高度和宽度怎么实现呢

Flex

三栏布局 双栏布局 图片懒加载 水平垂直居中

