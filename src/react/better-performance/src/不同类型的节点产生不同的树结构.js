import React from 'react'

const Main = () => {
  return (
    <div>
      <ul>
        <li key={'a'}>a</li>
        <li key={'b'}>b</li>
      </ul>

      <ul>
        <li key={'a'}>a</li>
        <li key={'c'}>c</li>
        <li key={'b'}>b</li>
      </ul>
    </div>
  )
}

export default Main
