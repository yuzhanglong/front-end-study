import React from "react";

const Login = () => {
  return <h2>请登录</h2>
}

const enhanceAuth = (WrapperCmp) => {
  return (props) => {
    const {isLogin} = props;
    if(isLogin){
      return <WrapperCmp {...props}/>
    }else {
      return <Login/>
    }
  }
}


const Data = () => {
  return (
    <div>data</div>
  )
}

const AuthData = enhanceAuth(Data);

const EnhanceAuth = (props) => {
  return (
    <div>
      <AuthData isLogin/>
    </div>
  )
}

export default EnhanceAuth;
