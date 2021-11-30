import React, { useMemo, useState } from 'react'

const cal = (count) => {
  console.log('执行计算')
  let total = 0
  for (let i = 1; i <= count; i++) {
    total += i
  }
  return total
}

const TryUseMemo = () => {
  const [count, setCount] = useState(10)
  const [show, setShow] = useState(false)
  let total = useMemo(() => cal(count), [count])
  return (
    <div>
      <h2>total:{total}</h2>
      <button onClick={() => setCount(count + 1)}>add</button>
      <button onClick={() => setShow(!show)}>change</button>
    </div>
  )
}

export default TryUseMemo
