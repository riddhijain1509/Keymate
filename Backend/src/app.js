import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express();
app.set("trust proxy", 1);
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods:  ['GET','POST','PUT','DELETE','PATCH'],
    credentials: true
}));


app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:false}));
app.use(express.static("public"));
app.use(cookieParser());

//Import routes
import userRouter from './routes/user.routes.js'
import passwordRouter from './routes/password.routes.js'

//Routes Declaration
app.use('/users',userRouter);
app.use('/password',passwordRouter);

export {app}
