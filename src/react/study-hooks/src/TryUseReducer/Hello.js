import React, {useReducer} from "react";
import reducer from "./reducer";


const Hello = () => {
  const [state, dispatch] = useReducer(reducer, null, () => {
    return {
      counter: 0
    }
  })
  return (
    <div>
      <div>value:{state.counter}</div>
      <button onClick={() => dispatch({type: "increment"})}>+1</button>
      <button onClick={() => dispatch({type: "decrement"})}>-1</button>
    </div>
  )
}
export default Hello;
