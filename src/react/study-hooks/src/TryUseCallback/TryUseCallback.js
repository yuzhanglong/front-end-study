import React, { useState, useCallback, memo } from 'react';

const MyButton = memo((props) => {
  console.log('子组件发生了重新渲染~' + props.name);
  return <button onClick={props.increment}>{props.name} add</button>;
});

const TryUserCallBack = () => {
  console.log('父组件发生了重新渲染~');
  const [count, setCount] = useState(0);
  const [test, setTest] = useState(false);
  const addOne = () => {
    console.log('add 1!');
    setCount(count + 1);
  };

  const addTwo = useCallback(() => {
    console.log('add 2!');
    setCount(count + 2);
  }, [count]);

  return (
    <div>
      <div>value:{count}</div>
      <MyButton increment={addOne} name={'btn1'} />
      <MyButton increment={addTwo} name={'btn2'} />
      <button onClick={() => setTest(!test)}>test</button>
    </div>
  );
};
export default TryUserCallBack;
