const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../../services/authentication');

router.post('/sign-in', async (req, res)=>{
  const {email, password} = req.body;
  try{
    const token = await User.matchPasswordAndGenerateToken(email, password);
    res.cookie('token', token,{httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',}).redirect('/');
  }
  catch(error){
    res.status(401).send({message:"Incorrect email or password"});
  }

});

router.post('/sign-up', async(req,res)=>{
  try {
    const { fullName, email, password } = req.body;
    const newUser = await User.create({ fullName, email, password });
    const token = generateToken(newUser);


    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).send({ message: "Sign-up successful", token });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});


module.exports = router;
