import dotenv from 'dotenv'
import connectDB from './db/index.js'
import { app } from './app.js'
import { initRedis } from './config/redis.js'
import { startAuditWorker } from './workers/audit.worker.js'

dotenv.config({
    path:'./.env'
})


connectDB()
.then(async ()=>{
    await initRedis();
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`APP IS LISTENING ON PORT ${process.env.PORT || 8000}`);
    });
    await startAuditWorker();
})
.catch((err)=>{
    console.log("MongoDB Connection Failed",err);
})
