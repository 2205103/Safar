const express = require("express");

const app = express();

const pg = require("../pg/database.js");

var resultJSON;

pg.query("SELECT * FROM train ORDER BY train_code", (err, res) => {
    if (!err) {
        resultJSON = JSON.stringify(res.rows);

    } else {
        console.error("Error executing query:", err);
    }
});


app.get('/',(req,res)=>{
    res.json(resultJSON);
})

module.exports=app;