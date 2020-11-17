import React from "react";

const enhanceAge = (Wrapper) => {
  return (props) => {
    return (
      <Wrapper {...props} age={20}/>
    )
  }
}

const User = (props) =>{
 return (
   <div>
     <div>name:{props.name}</div>
     <div>age:{props.age}</div>
   </div>
 )
}

const En = enhanceAge(User);

const EnhanceProps = (props) => {
  return (
    <div>
      <En name={"yzl"}/>
    </div>
  )
}

export default EnhanceProps;
