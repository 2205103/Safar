const express = require("express");

const app = express();

const pg = require("../pg/database.js");

var resultJSON;




app.get('/', (req, res) => {
    const id = req.query.id;

    pg.query(
        "SELECT * FROM route WHERE route_id = 103 ORDER BY route_id", 
        (err, result) => {
            if (!err) {
                res.json(result.rows);
            } else {
                console.error("Error executing query:", err);
                res.status(500).json({ error: "Database query failed" });
            }
        }
    );
});


module.exports=app;