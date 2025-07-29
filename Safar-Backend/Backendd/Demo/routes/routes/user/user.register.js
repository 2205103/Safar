const express = require('express');
const router = express.Router();
const client = require('../../pg/database.js');
const bcrypt = require("bcrypt");


router.post('/', async (req, res) => {
    const { name, phone_number, username, password } = req.body;

    const hashedPass = await bcrypt.hash(password, 10);

    const result = await client.query(`SELECT COALESCE(MAX(USER_ID), 0) + 1 AS user_id FROM PASSENGER;`);
    user_id = result.rows[0].user_id;

    client.query(
        `INSERT INTO PASSENGER (USER_ID,NAME,PHONE_NUMBER,USERNAME,PASSWORD)
        VALUES ($1,$2,$3,$4,$5)
    `, [user_id, name, (phone_number), username, hashedPass]
    );
    res.status(201);
    res.end();
});

module.exports = router;