/*
 * File: jwt.js
 * Description: 权限验证相关
 * Created: 2021-1-14 12:51:54
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const jwt = require('jsonwebtoken')

// 验证 TOKEN 的有效性
const verify = (token, secret = 'KEY') => {
  try {
    return jwt.verify(token, secret)
  } catch (e) {
    return false
  }
}

// 生成 TOKEN
const generateToken = (uid, exp = 1000) => {
  return jwt.sign(
    {
      userId: uid,
    },
    'KEY',
    {
      expiresIn: exp,
    }
  )
}

module.exports = {
  verify,
  generateToken,
}
