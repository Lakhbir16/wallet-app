const express = require('express')
const router =express.Router()
const db =require('./db')
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const JWT_Secret='admin@905472#e-wallet'  //secret code for salt

router.post('/signup',async (req,res)=>{
    const uuid = uuidv4();
    let user_id=uuid;
   let {name,email,pass}=req.body;

   const Token =jwt.sign({email,user_id},JWT_Secret,{expiresIn:'12h'});

    let query='INSERT INTO USERS (name,email,pass,token,id) VALUES(?,?,?,?,?)'
    try{
        
        await db.query(query,[name,email,pass,Token,uuid]);
        res.status(201).json({ message: 'User registered successfully.',email:email, token:Token });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});




router.post('/login', async (req,res)=>{
    let {email,pass} = req.body
    console.log(req.body);
    
    
    try{
       
      const [data] = await db.query('SELECT * FROM users WHERE email= ?',[email])
      const user=data[0];
      let user_id=user.id;
  
      if(!user || user.pass!== pass){
       return  res.status(200).json({Message:"Invalid Credintials !" })
      }

      const Token =jwt.sign({email,user_id},JWT_Secret,{expiresIn:'12h'});

      db.query('UPDATE users SET token=? WHERE email=?',[Token,email])

     res.status(200).json({Message:"Login Successfull",token:Token})
            
         
    }
    catch(error){
        res.status(404).json({Message:"User not Registered"})
    }
})

router.post('/get-userData',async (req,res)=>{
    let {token} = req.body;
    // console.log(req.body)
    
    jwt.verify(token,JWT_Secret,async (err,result)=>{
        if(err){
            return res.status(401).json({message:"Invalid Token"})
        }

        const {email}= result;

        try{
           const [data]= await db.query('SELECT * FROM users WHERE email=?',[email]);

           const publicUserData={
            id:data[0].id,
            name:data[0].name,
            email:data[0].email,
            token:data[0].token
           }
          
           res.status(200).json(publicUserData);
        }
        catch(err){
            if(err){
                res.status(500).json({message:"Internal server error, check token"})
            }
        }
    })
})

router.post('/get-data-by-id',async (req,res)=>{
    let {id}=req.body
    // console.log(req.body)
    try{
        let [data]= await db.query('SELECT * FROM users WHERE id=?',[id]);
         delete data[0].pass;
         delete data[0].token;
        res.status(200).json(data[0])
    }
    catch(err){
        if(err){
            return res.status(400).json({message:"This accout Is not Valid Or Suspanded"})
        }
    }
})

module.exports = router;
