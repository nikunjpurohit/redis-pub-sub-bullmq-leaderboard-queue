const express = require('express')
const redis = require('ioredis')
const mongoose = require('mongoose')
const dotenv = require('dotenv')


dotenv.config();
const app = express()
// 1. ADD THIS MIDDLEWARE to parse JSON bodies
app.use(express.json());

const Redis = new redis('redis://localhost:6379')

const connectDB = async () => {
    console.log(process.env.MONGO_URL)
  try {
    // Fetch the URL from process.env
    const conn = await mongoose.connect(process.env.MONGO_URL);
    
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

function otpKey(phone){
    return `otp:${phone}`
}

app.post ('/otp', async (req, res)=>{
    const {phone} = req.body
    const otp = Math.floor(100000+Math.random()*900000).toString()
    console.log(otp)

    await Redis.set(otpKey(phone), otp, 'EX', 600); // OTP valid for 30 seconds
    res.json({message: 'OTP sent', otp}); // In real application , send OTP via SMS

})


app.post('/otp/verify', async(req,res)=>{
    const {phone, otp}= req.body
    console.log(req.body)
    const savedOtp = await Redis.get(otpKey(phone))
    console.log(savedOtp)
    if(!savedOtp){
        return res.status(400).json({ message: 'OTP expired or not found'})
    }

    if (savedOtp != otp){
        return res.status(400).json({message: 'invalid OTP'})
    }
    await Redis.del(otpKey(phone));

    res.json({message: 'OTP verified succesfully'})


})


app.listen(3000,()=>{
    console.log("port started");
    connectDB()
    
})