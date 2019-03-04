import React, { Component } from 'react';
import Auth from '../../helpers/auth';
import './logdisplay.css'

const auth = new Auth();

class LogDisplay extends Component{
    constructor(props){
        super(props);
        this.state = {
            logs:""
        };
        this.updateLogs = this.updateLogs.bind(this);
    }

  componentDidMount() {
    this.timerId = setTimeout(function tick(){
      this.updateLogs()
      this.timerId = setTimeout(tick.bind(this), 5000)
    }.bind(this),100)
  }

  componentWillUnmount(){
    clearTimeout(this.timerId);
  }

  updateLogs(){
    if (auth.isAuthenticated()) {
      fetch("/water/activity/logs").then(response => response.text())
        .then(logs => {
          this.setState({ logs: logs })
        })
        .catch(e => {
            this.setState({logs: 'There was an error in the log recovery.'})
        })
    }
  }

    render(){
        if(auth.isAuthenticated()){
            return (
                <div className="logs-container">
                    <pre>{this.state.logs}</pre>
                </div>
            )
        }
        return null;
    }
}

export default LogDisplay;