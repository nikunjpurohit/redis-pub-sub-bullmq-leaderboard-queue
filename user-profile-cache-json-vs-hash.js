const express = require('express')
const redis = require('ioredis')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
// why redis not used in prod - 1) no retry 2) no parallel 3) 

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

app.post('/user/:id/hash', async (req, res) => {
    // FIX: Pass the req.body object directly into hset
    await Redis.hset(`user:${req.params.id}:json`, req.body);
    res.json({ savedAs: "hash" });
});

app.get("/user/:id/hash", async (req, res) => {
    // FIX: hgetall returns an object (or an empty object {} if not found)
    const data = await Redis.hgetall(`user:${req.params.id}:json`);
    
    // Check if the returned object has any keys
    if (Object.keys(data).length === 0) {
        return res.status(404).json({ error: "User data not found" });
    }

    // FIX: Send data directly, no JSON.parse needed!
    res.json({ data }); 
});
app.listen(3000,()=>{
    console.log("port started");
    connectDB()
    
})
