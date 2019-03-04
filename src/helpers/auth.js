import decode from './jwt-decode'

class Auth {
  constructor() {
    this.authResult = {};
  }

  login(body) {
    fetch("/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(response => {
      return response.json();
    }).then(data => {
      this.authResult = data;
      this.handleAuthentication();
    })
  }


  handleAuthentication() {
    if (this.authResult && this.authResult.token) {
      return this.setSession(this.authResult);
    }
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    const {exp, username} = decode(this.authResult.token);
    localStorage.setItem('access_token', this.authResult.token);
    localStorage.setItem('expires_at', exp * 1000);
    localStorage.setItem('username', username);
    // navigate to the home route
    // history.replace('/');
  }

  // removes user details from localStorage
  logout() {
    // Clear access token and ID token from local storage
    console.log("clearing localStorage...")
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('username');
    // navigate to the home route
    // history.replace('/');
  }

  isAuthenticated() {
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return Date.now() < expiresAt;
  }

  getAccessToken() {
    const accessToken = localStorage.getItem('access_token');
    return accessToken;
  }
}

export default Auth;