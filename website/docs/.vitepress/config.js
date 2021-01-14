module.exports = {
  lang: 'en-US',
  title: 'yzl-blog',
  head: [
    // add jquery and fancybox
    ['script', {src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.slim.min.js'}],
    ['script', {src: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.js'}],
    ['link', {
      rel: 'stylesheet',
      type: 'text/css',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.css'
    }]
  ],
  themeConfig: {
    docsDir: 'docs',
    nav: [],
    sidebar: {
      '/blog': getBlogSidebar(),
      '/': getBaseSidebar()
    }
  }
}

function getBaseSidebar() {
  return [
    {
      text: 'README',
      link: '/index'
    }
  ]
}

function getBlogSidebar() {
  return [
    {
      text: '介绍',
      link: '/blog/index'
    },
    {
      text: '深入探究React性能优化',
      link: '/blog/react-better-performance'
    },
    {
      text: 'axios源码解读',
      link: '/blog/axios-study'
    },
    {
      text: 'vue-router-next 源码解析',
      link: '/blog/vue-router-study'
    },
    {
      text: 'express & koa 框架对比及源码解析',
      link: '/blog/express-and-koa'
    },
    {
      text: 'webpack-loader & plugin 详解',
      link: '/blog/webpack-loader-and-plugin'
    },
    {
      text: 'webpack热更新(HMR)工作原理',
      link: '/blog/how-does-hmr-work'
    },
    {
      text: '一些有趣的ES6案例分析',
      link: '/blog/es6-examples'
    },
    {
      text: 'typescript 数据结构与算法',
      link: '/blog/typescript-algorithm'
    },
    {
      text: '分析浏览器和 NodeJS 的事件循环',
      link: '/blog/event-loop'
    },
    {
      text: 'typescript 工具类型解析',
      link: '/blog/typescript-utility-types'
    },
    {
      text: '谈谈前端性能优化',
      link: '/blog/frontend-better-performance'
    },
    {
      text: '基于 Koa 和 Websocket 实现二维码登录',
      link: '/blog/qr-code-login'
    }
  ]
}
