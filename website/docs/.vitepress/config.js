module.exports = {
  lang: 'en-US',
  title: 'yzl-blog',
  themeConfig: {
    docsDir: 'docs',
    nav: [],
    sidebar: {
      '/blog/': getBlogSidebar(),
    }
  }
}

function getBlogSidebar() {
  return [
    {
      text: '深入探究React性能优化',
      link: '/blog/react-better-performance'
    },
    {
      text: 'axios源码解读',
      link: '/blog/axios-study'
    }
  ]
}
