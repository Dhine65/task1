require('dotenv').config();
const MONGODB_URI=process.env.MONGODB_URI;
const PORT=process.env.PORT;
const JWTPASS=process.env.JWTPASS;

module.exports={
    MONGODB_URI,
    PORT,
    JWTPASS
}