require('dotenv').config();
const jwt = require('jsonwebtoken');

function jwtAuthentication(req, res, next) {
    try{
        const decoded = jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_KEY);
        req.userData = decoded;
        next();
    }catch(error) {
        return res.status(401).json({
            message: "Auth failed"
        })
    }
}

module.exports = jwtAuthentication