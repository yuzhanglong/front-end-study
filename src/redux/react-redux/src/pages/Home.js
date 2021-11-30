/*
 * File: Home.js
 * Description: redux 计数器demo
 * Created: 2020-11-9 14:08:48
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import React, { useEffect } from 'react'
import connect from '../utils/connect'
import { subAction, addAction, remoteDataAction } from '../store/action'

const Home = (props) => {
  useEffect(() => {
    props.getRemoteDataAction()
  }, [])
  return (
    <div>
      <h1>home</h1>
      <h2>当前计数：{props.counter}</h2>
      <h2>{props.remoteData}</h2>
      <button onClick={() => props.addAction(1)}>add</button>
      <button onClick={() => props.addAction(10)}>add 10</button>
      <button onClick={() => props.subAction(1)}>minus</button>
    </div>
  )
}
const mapStateToProps = (state) => {
  return {
    counter: state.counter,
    remoteData: state.data,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    addAction: (num) => {
      dispatch(addAction(num))
    },
    subAction: (num) => {
      dispatch(subAction(num))
    },
    getRemoteDataAction: () => {
      console.log('home dispatch!!')
      dispatch(remoteDataAction())
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
