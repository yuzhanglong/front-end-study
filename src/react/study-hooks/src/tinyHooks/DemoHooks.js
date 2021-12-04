import React from 'react';
import { render } from '../index';

// version 1 单个state，利用了闭包，但是全局只能使用一次
// let state = null;
// export const useState = (initialValue) => {
//   state = state || initialValue;
//   const setState = (newState) => {
//     state = newState;
//     render();
//   }
//   return [state, setState];
// }
// version 2 可以支持多个state 这里存放的数据结构是数组，当然我们也可以使用链表
let memorizedState = [];
let currentPosition = 0;

const doRender = () => {
  currentPosition = 0;
  render();
};

export const useState = (initialValue) => {
  memorizedState[currentPosition] =
    memorizedState[currentPosition] || initialValue;
  // 这里复制了currentPosition，保证一个useState对应正确的Position
  const currentStatePos = currentPosition;
  const setState = (newState) => {
    memorizedState[currentStatePos] = newState;
    doRender();
  };
  return [memorizedState[currentPosition++], setState];
};

const DemoHooks = () => {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState('hello');
  console.log(memorizedState);
  return (
    <div>
      <div>{count}</div>
      <div>{count2}</div>
      <button onClick={() => setCount(count + 1)}>add!</button>
      <button onClick={() => setCount2(count2 + 'aaa')}>add-2!</button>
    </div>
  );
};

export default DemoHooks;
