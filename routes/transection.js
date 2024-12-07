const express = require("express");
const router = express.Router();
const db = require("./db");
const jwt = require('jsonwebtoken');

const JWT_Secret='admin@905472#e-wallet' 

router.post("/credit-amount", async (req, res) => {
  let { user_id, amount } = req.body;

  if (!user_id || !amount) {
    return res.status(400).json({ message: "ID and amount are required." });
  }

  try {
    let [result] = await db.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    let [result2] = await db.query(
      "SELECT * FROM userbalance WHERE user_id = ?",
      [user_id]
    );

    if (result2.length == 0) {
      await db.query("INSERT INTO userbalance(user_id,balance) VALUES(?,?)", [
        user_id,
        amount,
      ]);
    }

    await db.query(
      "UPDATE userbalance SET balance = balance + ? WHERE user_id = ?",
      [amount, user_id]
    );

    res.json({ message: "Amount stored successfully." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: "An error occurred while updating the balance.",
        error: err.message,
      });
  }
});






router.post("/debit-amount", async (req, res) => {
  let { user_id, amount } = req.body;

  // Validate input
  if (!user_id || !amount) {
    return res
      .status(400)
      .json({ message: "User ID and amount are required." });
  }

  try {
    // Check if the user exists
    let [userResult] = await db.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check the user's balance
    let [balanceResult] = await db.query(
      "SELECT * FROM userbalance WHERE user_id = ?",
      [user_id]
    );
    console.log(balanceResult[0].balance < amount); //2540.00
    if (balanceResult.length === 0 || balanceResult[0].balance < amount) {
      return res
        .status(400)
        .json({ message: "Insufficient balance to make this transaction!" });
    }

    // Update the user's balance
    await db.query(
      "UPDATE userbalance SET balance = balance - ? WHERE user_id = ?",
      [amount, user_id]
    );

    res.json({ message: "Transaction successful." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: "An error occurred while updating the balance.",
        error: err.message,
      });
  }
});



router.post('/get-user-balance',async (req,res)=>{
    
    let {token} = req.body;
    
    jwt.verify(token,JWT_Secret,async (err,result)=>{
        if(err){
            return res.status(401).json({message:"Invalid Token"})
        }

        const {user_id}= result;

        try{
            let [data]= await db.query('SELECT * FROM userbalance WHERE user_id= ?',[user_id])        
            res.send(data[0].balance)
        }
        catch(err){
            res.json(0)
        }

    })

   
})


 router.post('/get-user-transaction-history',async (req,res)=>{
    let {user_id}= req.body;
    // console.log(user_id)

    try{
       let [data]= await db.query('SELECT * FROM t_history WHERE user_id= ?',[user_id])

       res.json(data);
    }
    catch(err){
        res.send(err);
    }
})

module.exports = router;
