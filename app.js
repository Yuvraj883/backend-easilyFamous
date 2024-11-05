const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const userRoute = require('./routes/User');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(()=>{console.log("DB connected")}).catch((e)=>{console.log("Mongoose error: ",e)});

const PORT = 8000;
app.use(express.json());

app.use('/user',userRoute );
app.get('/', async(req, res)=>{
  // const user = await User.create({
  //   fullName:"Yuvraj Singh",
  //   email:"devyuvraj883@gmail.com",
  //   password:"Yuvraj123"
  // });
  res.send("Welcome");
})

app.listen(PORT, ()=>{console.log(`Server started at port ${PORT}`)})

module.exports = app; 
