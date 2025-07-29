const jwt = require("jsonwebtoken");
const client = require('../pg/database.js');

const checkToken = async (req, res, next) => {
    const { authorization } = req.headers;

    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.jwt_secret);
        const user_id = decoded.user_id;
     
        req.body.User_id = user_id;

        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: "Authentication Failure" });
    }
};

module.exports = checkToken;
