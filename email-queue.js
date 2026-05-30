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
const QUEUE_KEY = "queue:emails"
app.post('/emails', async (req,res)=>{
    const job={
        to: req.body.to,
        subject: req.body.subject || 'No subject',
        body: req.body.body || 'No content',
        createdAt: new Date().toISOString()

    }

    await Redis.lpush(QUEUE_KEY, JSON.stringify(job))
    res.json({queued: true, job})
})

app.get('/emails/process-one' , async (req,res)=>{
    const rawJob = await Redis.rpop(QUEUE_KEY);
    if(!rawJob){
        return res.json({message: ' No jobs in the queue'})
    }

    const job = JSON.parse(rawJob);
    //simulate 

    res.json({ message: 'Email sent', job})

})

app.listen(3000,()=>{
    console.log('server started')
    connectDB()
})