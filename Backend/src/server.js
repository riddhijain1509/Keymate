import dotenv from 'dotenv'
import http from 'http'
import connectDB from './db/index.js'
import { app } from './app.js'
import { initRedis } from './config/redis.js'
import { startAuditWorker } from './workers/audit.worker.js'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { User } from './models/user.model.js'
import { setSocketServer } from './utils/socket.js'

dotenv.config({
    path:'./.env'
})


connectDB()
.then(async ()=>{
    await initRedis();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace("Bearer ", "");

            if (!token) {
                return next(new Error("Unauthorized socket connection"));
            }

            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select("_id email username fullname");
            if (!user) {
                return next(new Error("Invalid socket user"));
            }

            socket.user = user;
            return next();
        } catch {
            return next(new Error("Unauthorized socket connection"));
        }
    });

    io.on("connection", (socket) => {
        socket.join(`user:${socket.user._id}`);
    });

    setSocketServer(io);

    server.listen(process.env.PORT || 8000,()=>{
        console.log(`APP IS LISTENING ON PORT ${process.env.PORT || 8000}`);
    });
    await startAuditWorker();
})
.catch((err)=>{
    console.log("MongoDB Connection Failed",err);
})
