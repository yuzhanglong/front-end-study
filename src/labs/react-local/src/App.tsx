/*
 * File: App.tsx
 * Description: App 组件
 * Created: 2021-3-6 00:57:33
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import React from 'react'
import LocalProvider from './local/LocalProvider'
import Button from './components/Button'
import Chinese from './languages/chinese'

interface AppProps {

}

const App: React.FunctionComponent<AppProps> = () => {
  return (
    <LocalProvider local={Chinese}>
      <div>
        <Button />
      </div>
    </LocalProvider>

  )
}

export default App
