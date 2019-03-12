import React, { Component } from 'react';
import Auth from '../../helpers/auth';
import './status.css';

const auth = new Auth();

/**
 * Show watering status (check if gpio pin is active)
 */
class Status extends Component {
    constructor(props) {
        super(props);
        this.state = {"backyard": "inactive", "frontyard": "inactive", "timeInMinutes": ""}
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getWaterStatus = this.getWaterStatus.bind(this);
    }

    componentDidMount(){
        // Get status of backyard & front yard from server, either gpio pin or python script
        let timerId = setTimeout(function tick () {
            this.getWaterStatus();
            timerId = setTimeout(tick.bind(this), 5000)
        }.bind(this), 100)
    }

    getWaterStatus(){
        if(auth.isAuthenticated()){
            fetch("/status/water", {
                headers: this.auth.getHeaders()
            }).then(response => {
                return response.json()
            }).then(json => {
                this.setState(json)
            }).catch((err) => {
                console.log(err);
            })
        }
        this.setState(this.state);
    }

    handleClick(options, e){
        let isFrontyardActive = this.state.frontyard === "active" ? true : false;
        let isBackyardActive = this.state.backyard === "active" ? true : false;
        let state = Object.assign({}, this.state)
        console.log(state)
        if(options.backyard === true){
            state.backyard = isBackyardActive ? "inactive" : "active"
            if(isBackyardActive){
                fetch("/water/deactivate/backyard/", {
                    method: 'POST',
                    headers: this.auth.getHeaders()
                })
            }
            else{
                fetch(`/water/activate/backyard/${state.timeInMinutes}`, {
                    method: 'POST',
                    headers: this.auth.getHeaders()
                })
            }
        }
        if(options.frontyard === true){
            state.frontyard = isFrontyardActive ? "inactive" : "active"
            if(isFrontyardActive){
                fetch("/water/deactivate/frontyard", {
                    method: 'POST',
                    headers: this.auth.getHeaders()
                })
            }
            else{
                fetch(`/water/activate/frontyard/${state.timeInMinutes}`, {
                    method: 'POST',
                    headers: this.auth.getHeaders()
                })
            }
        }
        this.setState(state);
    }

    handleChange(e){
        this.setState({"timeInMinutes": e.target.value})
    }

    render() {
        const isBackyardActive = this.state.backyard;
        const isFrontyardActive = this.state.frontyard;
        let backyard;
        let frontyard;
        let minutes;

        if(auth.isAuthenticated()){
            backyard = <div className={"backyard " + isBackyardActive} onClick={(e) => this.handleClick({backyard: true}, e)}> Backyard is {isBackyardActive} </div>
            frontyard = <div className={"frontyard " + isFrontyardActive} onClick={(e) => this.handleClick({frontyard: true}, e)}> Frontyard is {isFrontyardActive} </div>
            minutes = <div className="time-input"><input type="text" placeholder="minutes" onChange={this.handleChange} /></div>
        }

        return (
            <div>
                <div className="watering-system">
                    <h1>Watering System Dashboard</h1>
                    {minutes}
                    {backyard}
                    {frontyard}
                </div>
            </div>
        )
    }
}

export default Status;