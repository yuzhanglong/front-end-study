import React, {useMemo} from "react";
import {useState} from "react";

const getTenBigger = (cnt) => {
  console.log("函数被重新定义");
  return cnt + 10;
}

const TryUseMemo = () => {
  const [cnt, setCnt] = useState(0);
  const [flag, setFlag] = useState(false);

  let tenBigger = useMemo(() => getTenBigger(cnt), [cnt]);
  return (
    <div>
      <div>{tenBigger}</div>
      <div>{flag ? "yes" : "no"}</div>
      <button onClick={() => setCnt(cnt + 1)}>add!</button>
      <button onClick={() => setFlag(!flag)}>set flag</button>
    </div>
  )
}

export default TryUseMemo;
