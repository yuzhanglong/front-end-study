module.exports = {
  lang: 'en-US',
  title: 'yzl-blog',
  themeConfig: {
    docsDir: 'docs',
    nav: [],
    sidebar: {
      '/blog': getBlogSidebar()
    }
  }
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
    }
  ]
}
