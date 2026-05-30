const Redis = require('ioredis');

const subscriber = new Redis({
    host:"localhost",
    port:6379
})
const channel = "notifications";
subscriber.subscribe(channel ,(err)=>{
    if(err){
        console.log("errr",err)
    }
    console.log("Subscribed to channel", channel)
})

subscriber.on("message", (channel, message)=>{
    console.log("Received message", channel, "on channel", JSON.parse(message))
})


