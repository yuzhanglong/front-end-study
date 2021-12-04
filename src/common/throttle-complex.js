/**
 * 节流函数 demo，限制一个 ip 地址一分钟内只允许被请求 60 次
 *
 * @author yuzhanglong
 * @param reqFn 请求函数，该函数的第一个参数为 目标 ip
 * @param timeout 间隔时间
 * @param limitation 请求次数限制
 * @date 2021-3-14 12:40:25
 */
const throttle = (reqFn, timeout, limitation = 4) => {
  const myIpMap = new Map();

  return function (targetIp, ...args) {
    if (!myIpMap.has(targetIp)) {
      myIpMap.set(targetIp, 0);
    }
    const shouldLimit = myIpMap.get(targetIp) >= limitation;
    if (shouldLimit) {
      console.log(`the ip ${targetIp} has been banned!`);
      setTimeout(() => {
        myIpMap.set(targetIp, 0);
      }, timeout);
    } else {
      reqFn.call(this, targetIp, ...args);
      myIpMap.set(targetIp, myIpMap.get(targetIp) + 1);
    }
  };
};

const reqFn = function (ip) {
  console.log(`请求 IP：${ip}`);
};

const req = throttle(reqFn, 3000);

console.log('立刻尝试请求 10 次');
for (let i = 0; i < 10; i++) {
  req('127.0.0.1');
}

setTimeout(() => {
  console.log('4 秒过后再次请求 10 次');
  for (let i = 0; i < 10; i++) {
    req('127.0.0.1');
  }
}, 4000);
