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
      avatar: 'https://avatars1.githubusercontent.com/u/56540811?s=400&u=0e3102e70a29e7eb128a6333a073955329677f43&v=4',
    }
  }
}