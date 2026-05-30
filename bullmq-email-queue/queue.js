const  { Queue } = require('bullmq');

const connection ={
    host: "localhost",
    port:6379
}

const emailQueue = new Queue('emails', {connection});


module.exports={
    emailQueue,
    connection
}