import React, { Component } from 'react';
import { checkWebRTC } from './rtc.js';
import './App.css';

class App extends Component {

  state = {
    rtcState: null
  }

  prettyPrintJSON = json => {
	  return JSON.stringify(json, null, 4);
  }

  componentDidMount(){
    this.logDetectRTC();
  }

  logDetectRTC(){
    checkWebRTC((rtcState) => {
      this.setState({
        rtcState
      });
    });
  }

  render() {
    return (
      <div className={"App"}>
        <button onClick={() => this.logDetectRTC()}>detect rtc</button>
        <pre className={"json"}>
          {this.prettyPrintJSON(this.state.rtcState)}
        </pre>
      </div>
    );
  }
}

export default App;
