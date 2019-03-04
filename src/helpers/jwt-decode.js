function InvalidTokenError(message){
    this.message = message;
}

/**
 * Decode a JWT token encoded in base64
 * @param {*} token The JWT Token
 */
function decode(token){
    try{
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        throw new InvalidTokenError('Invalid token specified: ' + e.message);
    }

}

export default decode;