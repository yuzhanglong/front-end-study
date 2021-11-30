import React, { memo, useCallback, useState } from 'react'

const MyButton = memo((props) => {
  console.log('button render! ==> ' + props.flag)
  return (
    <div>
      <button onClick={() => props.add()}>set!</button>
    </div>
  )
})

const TryUseCallBack = () => {
  const [flag, setFlag] = useState(false)
  const [cnt, setCnt] = useState(0)

  const setMyFlag = () => {
    setFlag(!flag)
  }

  const addOne = () => {
    setCnt(cnt + 1)
  }

  const addTwo = useCallback(() => {
    setCnt(cnt + 2)
  }, [cnt])

  console.log('main render!')
  return (
    <div>
      <div>{cnt}</div>
      <div>{flag ? 'yes' : 'no'}</div>
      <MyButton add={addOne} flag={'button1'} />
      <MyButton add={addTwo} flag={'button2'} />
      <button onClick={() => setMyFlag()}>set flag</button>
    </div>
  )
}

export default TryUseCallBack
