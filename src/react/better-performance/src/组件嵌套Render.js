import React from "react";

class Banner extends React.PureComponent {
  render() {
    console.log("banner render!");
    return (
      <div>banner -- div</div>
    )
  }
}

const List = () => {
  console.log("list render!");
  return (
    <ul>
      <li>11</li>
      <li>22</li>
      <li>33</li>
      <li>44</li>
    </ul>
  )
}

class Main extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      counter: 0
    }
  }

  add() {
    this.setState({
      counter: this.state.counter + 1
    })
  }


  render() {
    console.log("Main render!");
    return (
      <div>
        <div>current:{this.state.counter}</div>
        <button onClick={() => this.add()}>add!</button>
        <Banner/>
        <List/>
      </div>
    )
  }

}

export default Main;
