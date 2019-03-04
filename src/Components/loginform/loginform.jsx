import React, { Component } from 'react';
import Auth from '../../helpers/auth';
import './loginform.css';


class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = { username: '' };
    this.auth = new Auth();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.logout = this.logout.bind(this);
    this.testAuth = this.testAuth.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    
    let form = event.target;
    let username = form["username"].value;
    let password = form["password"].value;
    const data = {
      username,
      password
    };

    this.auth.login(data);
    this.setState({ username: data.username });
    this.props.history.push('/')
  }

  testAuth() {
    console.log(this.auth.isAuthenticated());
    console.log(this.state)
  }

  logout() {
    this.auth.logout();
    this.setState({ username: '' })
    this.props.history.push('/')
  }

    render() {
      if(this.auth.isAuthenticated()){
        return (
          <div className="login">
          <input type="button" value="test auth!" onClick={this.testAuth}/>
          <input type="button" value="logout" onClick={this.logout}/>
          </div>
        )
      }
        return(
          <div className="login">
            <form onSubmit={this.handleSubmit}>
              <input type="text" name="username" placeholder="username"/>
              <input type="password" name="password" placeholder="password"/>
              <input type="submit" value="Submit" />
              <input type="button" value="test auth!" onClick={this.testAuth}/>
            </form>
          </div>
        )
    }
}

export default LoginForm;