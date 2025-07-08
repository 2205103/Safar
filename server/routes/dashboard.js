const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorize");

router.get("/", authorization, async (req, res) => {
    try {
        
        const person = await db.query("SELECT * FROM passenger WHERE user_id = $1",
        [req.user]);

        res.json(person.rows[0]);

    } catch (error) {
        console.log(error.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;