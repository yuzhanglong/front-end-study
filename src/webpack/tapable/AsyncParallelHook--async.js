const { AsyncParallelHook } = require('tapable');

const hook = new AsyncParallelHook(['name']);

hook.tapAsync('hello', async (name, cb) => {
  await setTimeout(() => {
    console.log(`hello ${name} after 1s!`);
    cb();
  }, 1000);
});

hook.tapAsync('hello again', async (name, cb) => {
  await setTimeout(() => {
    console.log(`hello ${name}, again after 1s!`);
    cb();
  }, 1000);
});

hook.tapAsync('hello again', async (name, cb) => {
  await setTimeout(() => {
    console.log(`hello ${name}, again after 1s!`);
    cb();
  }, 1000);
});

hook.tapAsync('hello again', async (name, cb) => {
  await setTimeout(() => {
    console.log(`hello ${name}, again after 1s!`);
    cb();
  }, 1000);
});

hook.callAsync('call-end', () => {
  console.log('hello!');
});
