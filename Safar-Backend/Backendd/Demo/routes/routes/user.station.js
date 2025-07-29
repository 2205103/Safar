const express = require("express");

const app = express();

const pg = require("../pg/database.js");

var resultJSON;

pg.query("SELECT * FROM station ORDER BY station_id", (err, res) => {
    if (!err) {
        resultJSON = JSON.stringify(res.rows); // convert to JSON string if needed

    } else {
        console.error("Error executing query:", err);
    }
});


app.get('/',(req,res)=>{
    res.json(resultJSON);
})

module.exports=app;