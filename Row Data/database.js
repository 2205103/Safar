const { Client } = require('pg');

const client = new Client({
    host: "localhost",
    port: "5432",
    user: "postgres",
    password: "11220133",
    database: "Safar"
});

client.connect();

client.query("SELECT * FROM station order by station_id", (err, res) => {
    if (!err) {
        console.log(res.rows);
    } else {
        console.error("Error executing query:", err);
    }
    client.end();
});
