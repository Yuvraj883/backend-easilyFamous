const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

})

module.exports = router;
