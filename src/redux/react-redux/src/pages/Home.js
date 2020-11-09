/*
 * File: Home.js
 * Description: redux 计数器demo
 * Created: 2020-11-9 14:08:48
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import React from "react";
import connect from "../utils/connect";
import {subAction, addAction} from "../store/action"

const Home = (props) => {
  console.log(props);
  return (
    <div>
      <h1>home</h1>
      <h2>当前计数：{props.counter}</h2>
      <button onClick={() => props.addAction(1)}>add</button>
      <button onClick={() => props.addAction(10)}>add 10</button>
      <button onClick={() => props.subAction(1)}>minus</button>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    counter: state.counter
  }
};

const mapDispatchToProps = dispatch => {
  return {
    addAction: (num) => {
      dispatch(addAction(num));
    },
    subAction: (num) => {
      dispatch(subAction(num));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
