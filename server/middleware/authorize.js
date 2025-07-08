const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports = function(req, res, next) {
  const token = req.header("jwt_token");

  if (!token) {
    console.log("aurthorization denied");
    return res.status(403).json({ msg: "authorization denied" });
  }

  try {

    const verify = jwt.verify(token, process.env.jwtSecret);
    console.log("aurthorization success");
    req.user = verify.user;
    
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
  next();
};