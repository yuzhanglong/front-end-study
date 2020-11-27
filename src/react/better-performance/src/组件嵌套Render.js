import React, {memo} from "react";

class Footer extends React.PureComponent {
  render() {
    console.log("Footer component render!");
    return (
      <div>Footer组件</div>
    )
  }
}

const List = memo(() => {
  console.log("List component render!");
  return (
    <ul>
      <li>Hello</li>
      <li>world</li>
    </ul>
  )
})

class Main extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      count: 0
    }
  }

  add() {
    console.log("add按钮被单击!");
    this.setState({
      count: this.state.count + 1
    })
  }

  render() {
    console.log("Main render!");
    return (
      <div>
        <div>current:{this.state.count}</div>
        <button onClick={() => this.add()}>add one</button>
        <List/>
        <Footer/>
      </div>
    )
  }

}

export default Main;
