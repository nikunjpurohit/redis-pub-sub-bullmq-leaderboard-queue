const express = require("express")
const {emailQueue} = require("./queue.js")
const app = express()

app.use(express.json())



app.post("/send-email", async (req,res)=>{
    const job = await emailQueue.add("send-welcome-email", {
        to: req.body.to,
        name: req.body.name || "Leaner"
    },{
        attempts:3,
        backoff:{
            type: "exponential",
            delay: 1000
        },
       
    })
    console.log("Job added", job)
    
    return res.json({status:"Job Added", id: job.id})

})

app.listen(3000,()=>{
    console.log("Server Started on port 3000")
})