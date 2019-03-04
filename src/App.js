import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Status from './Components/status/status';
import Chart from './Components/chart/chart';
import LoginForm from './Components/loginform/loginform';
import LogDisplay from './Components/logdisplay/logdisplay';
import Auth from './helpers/auth'

const auth = new Auth();

class App extends Component {
  render() {
    return (
      <div className="App-container">
        <div className="App">
          <LoginForm {...this.props}/>
          <Status />
          <LogDisplay />
          <Chart />
        </div>
      </div>
    );
  }
}

export default App;
