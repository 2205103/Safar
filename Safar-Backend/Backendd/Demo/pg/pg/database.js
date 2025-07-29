const { Client } = require('pg');

const client = new Client({
    host: "localhost",
    port: "5432",
    user: "postgres",
    password: "11220133",
    database: "Safar"
});

client.connect();

module.exports=client;