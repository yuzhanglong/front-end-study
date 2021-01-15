module.exports = {
  lang: 'en-US',
  title: 'yzl-blog',
  head: [
    ['script', {src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.slim.min.js'}],
    ['script', {src: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.js'}],
    ['link', {
      rel: 'stylesheet',
      type: 'text/css',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.css'
    }]
  ],
  theme: 'meteorlxy',
  themeConfig: {
    docsDir: 'docs',
    lang: 'zh-CN',
    personalInfo: {
      // 昵称
      nickname: 'yuzhanglong',
      description: 'hello world~',
      email: 'yuzl1123@163.com',
      location: 'HangZhou City, China',
      avatar: 'http://cdn.yuzzl.top/blog/20210115165658.png',
    },
    header: {
      background: {
        url: 'http://cdn.yuzzl.top/blog/20210115170459.png',
        useGeo: false,
      },
      showTitle: true,
    },
    footer: {
      poweredBy: false,
      poweredByTheme: false,
      custom: 'Copyright 2020 <a href="https://github.com/yuzhanglong" target="_blank">yuzhanglong</a> | MIT License',
    },
    pagination: {
      perPage: 15,
    },
    nav: [
      {text: "主页", link: "/", exact: true},
      {
        text: "往期博文",
        link: "/posts/",
        exact: false,
      },
      {
        text: 'Github', link: 'https://github.com/yuzhanglong'
      },
    ],
  }
}