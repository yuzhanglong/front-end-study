/*
 * File: Button.tsx
 * Description: 模拟 button 组件
 * Created: 2021-3-6 00:58:56
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import React from 'react'
import { useLocal } from '../local/useLocal'

interface ButtonProps {}

const Button: React.FunctionComponent<ButtonProps> = () => {
  const [local] = useLocal()
  return (
    <div>
      <button>{local.confirmText}</button>
    </div>
  )
}

export default Button
