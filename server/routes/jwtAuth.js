
const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const authorization = require("../middleware/authorize");

//register route




//login
router.post("/users/login", async (req, res) => {
    try {
      const results = await db.query("SELECT * FROM passenger WHERE email = $1", [req.body.email]);
      const isOldPasswordValid = await bcrypt.compare(req.body.password, results.rows[0].password);
      if (!isOldPasswordValid) {
  
        return res.status(401).json({ message: "Invalid password" });
      }
  
      console.log("login successful");
      const jwtToken = jwtGenerator(results.rows[0].user_id);
      console.log(jwtToken);
      res.status(200).json({
        status: "success",
        data: {
        //   result: results.rows,
          res: { jwtToken }
        },
        message: "Login Successful"
      });
    }
    catch (err) {
      console.error(err.message);
    }
  });


//verify route

router.get("/is-verify", authorize, async (req, res) => {
    try {
        res.json(true);
    } catch (error) {
        console.log(err.message);
        res.status(500).json("Server Error");
    }
});





// Create a user

router.post("/users", async (req, res) => {
    console.log(req.body);
    const { email, phone_number, password } = req.body;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    try {
      const phone_number = req.body.phone_number
      const email = req.body.email;
      console.log(phone_number + " " + email);
      //
      if (!email && !phone_number) {
        return res.status(300).json({ status: "email and phone_number cannot both be empty" });
      }
      else if (!email && phone_number) {
        const result1 = await db.query('SELECT * FROM passenger WHERE phone_number = $1', [req.body.phone_number]);
  
        if (result1.rows.length !== 0) {
          // res.send("user already exists")
          res.status(400).json(
            {
              status: "user already exists",
              "userID": result1.rows[0].user_id
            }
          )
        }
        else {
          const results = await db.query(
            'INSERT INTO passenger (first_name,last_name,email,gender,phone_number,nid_number,date_of_birth,address,birth_registration_number,post_code,password) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [req.body.first_name, req.body.last_name, req.body.email, req.body.gender, req.body.phone_number, req.body.nid_number, req.body.date_of_birth, req.body.address, req.body.birth_registration_number, req.body.post_code, req.body.password]
          );
          //console.log("row start");
          const jwtToken = jwtGenerator(results.rows[0].user_id);
          console.log(results.rows[0].user_id);
          return res.json({ jwtToken });
  
          /*res.status(201).json({
            status: "succes",
            "userID": results.rows[0].user_id,
            
          });*/
        }
      }
  
      else if (!phone_number && email) {
        const result2 = await db.query('SELECT * FROM passenger WHERE email = $1', [req.body.email]);
  
        if (result2.rows.length !== 0) {
          res.status(400).json(
            {
              status: "user already exists",
              "userID": result2.rows[0].user_id
            }
          )
        }
  
        else {
          const results = await db.query(
            'INSERT INTO "user" (first_name,last_name,email,gender,phone_number,nid_number,date_of_birth,address,birth_registration_number,post_code,password) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [req.body.first_name, req.body.last_name, req.body.email, req.body.gender, req.body.phone_number, req.body.nid_number, req.body.date_of_birth, req.body.address, req.body.birth_registration_number, req.body.post_code, hashedPassword]
          );
          const jwtToken = jwtGenerator(results.rows[0].user_id);
          console.log(results.rows[0].user_id);
          return res.json({ jwtToken });
          /*res.status(201).json({
            status: "succes",
            "userID": results.rows[0].user_id
          });*/
        }
      }
      else {
        const check = await db.query('SELECT * FROM passenger WHERE email = $1 OR phone_number = $2', [req.body.email, req.body.phone_number]);
        console.log(check);
        if (check.rows.length !== 0) {
          res.status(400).json(
            {
              status: "user already exists",
              "userID": check.rows[0].user_id
            }
          )
        }
        //
        else {
          const results = await db.query(
            'INSERT INTO passenger (first_name,last_name,email,gender,phone_number,nid_number,date_of_birth,address,birth_registration_number,post_code,password) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [req.body.first_name, req.body.last_name, req.body.email, req.body.gender, req.body.phone_number, req.body.nid_number, req.body.date_of_birth, req.body.address, req.body.birth_registration_number, req.body.post_code, hashedPassword]
          );
          //console.log("row start");
          console.log(results.rows[0].user_id);
          //console.log("row end");
          res.status(201).json({
            status: "succes",
            "userID": results.rows[0].user_id
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  });

  
module.exports = router;