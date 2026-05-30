const  { Worker } = require ('bullmq');
const { connection } = require('./queue.js');


const worker = new Worker(
  'emails',
  async job => {
  
    console.log("processing email job too...",job.data, job.id, job.name);
    await new Promise((resolve)=>setTimeout(resolve,5000));
    console.log("processing email job completed", job.data, job.id, job.name);

  },
  { connection },
);

worker.on("completed", (job)=>{console.log("Job completed", job.data, job.id, job.name)});

worker.on("failed",(job,Error)=>{console.log("Job Failed", Error.message, job.data, job.id, job.name)})

