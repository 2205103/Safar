const express = require('express');
const router = express.Router();
const {client} = require('../../pg/database.js');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


//jwt token je kew dekhte paarbe, password ba emon kisu rakha jaabe na


router.post('/', async (req, res) => {
    const { username, password } = req.body;

    const result = await client.query(`SELECT user_id, password FROM PASSENGER where username=$1;`, [username]);
    if (result.rows[0].user_id) {
        const isValid = await bcrypt.compare(password, result.rows[0].password);

        if (isValid) {

            const token = jwt.sign({
                    user_id: result.rows[0].user_id
                },process.env.jwt_secret,{
                    expiresIn: '5m'
                });
            console.log("LOGIN!!");
            res.status(200).json({
                "access_token": token
            });
        }
        else {
            res.status(401).json({
                "error": "Wrong Password"
            });
        }
    }
    else {
        res.status(401).json({
            "error": "Wrong Username"
        });
    }
});

module.exports = router;