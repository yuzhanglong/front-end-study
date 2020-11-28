import React from "react";

class User extends React.PureComponent {
  render() {
    return (
      <div>
        <div>{this.props.user.name}</div>
        <div>{this.props.user.age}</div>
      </div>
    )
  }
}

const userInfo = {
  name: "yzl",
  age: 20
};

class DoNotUseInlineObject extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      cnt: 0
    }
  }

  add() {
    console.log("add按钮被单击!");
    this.setState({
      cnt: this.state.cnt + 1
    })
  }

  render() {
    return (
      <div>
        <div>{this.state.cnt}</div>
        <button onClick={() => this.add()}>add!</button>
        <User user={userInfo}/>
      </div>
    )
  }
}

export default DoNotUseInlineObject;
