const { Fullscreen } = require('@mui/icons-material');
const JWT = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SECRET_KEY;

function generateToken(user){
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImage: user.profileImage
  }
  const token = JWT.sign(payload, secret, {expiresIn:'2h'});
  return token;
}

function validateToken(token){
  const payload = JWT.verify(token, secret);
  return payload;
}


module.exports = {generateToken, validateToken};
