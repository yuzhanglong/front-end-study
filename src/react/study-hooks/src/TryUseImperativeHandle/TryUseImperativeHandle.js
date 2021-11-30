import React, { useImperativeHandle, useRef } from 'react'

const MyInput = React.forwardRef((props, ref) => {
  const myRef = useRef()
  useImperativeHandle(ref, () => {
    return {
      focus: () => {
        myRef.current.focus()
      },
    }
  })
  return <input type={'text'} ref={myRef} />
})

const TryUseImperativeHandle = () => {
  const inputRef = useRef()
  return (
    <div>
      <MyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>focus!</button>
    </div>
  )
}

export default TryUseImperativeHandle
