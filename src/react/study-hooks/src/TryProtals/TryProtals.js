import React from "react";
import ReactDOM from "react-dom";

const Modal = (props) => {
  return ReactDOM.createPortal(
    props.children,
    document.getElementById("modal")
  )
}

const TryProtals = () => {
  return (
    <div>
      <Modal>
        <h2>title</h2>
      </Modal>
    </div>
  )
}
export default TryProtals;
