(function () {
  require.config({
    baseUrl: '',
    paths: {
      foo: './modules/foo',
      bar: './modules/bar',
    },
  });

  // 开始加载执行foo模块的代码
  require(['foo'], function (foo) {
    console.log('foo success!');
  });
})();
