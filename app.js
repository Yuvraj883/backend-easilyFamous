const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(()=>{console.log("DB connected")}).catch((e)=>{console.log("Mongoose error: ",e)});

const PORT = 8000;

app.listen(PORT, ()=>{console.log(`Server started at port ${PORT}`)})
