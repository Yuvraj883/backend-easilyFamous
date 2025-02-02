const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const userRoute = require('./src/routes/User');
const User = require('./src/models/User');
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const orderRoutes = require("./src/routes/proxy");
app.use(bodyParser.json());
app.use(cors());

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


// Rate Limiter (1 request per 6 hours)
const limiter = rateLimit({
  windowMs: 6 * 60 * 60 * 1000, // 6 hours
  max: 1,
  message: "You have already claimed within the last 6 hours.",
});

app.use("/api", limiter);
app.use("/api/orders", orderRoutes);


app.listen(PORT, ()=>{console.log(`Server started at port ${PORT}`)})

module.exports = app;
