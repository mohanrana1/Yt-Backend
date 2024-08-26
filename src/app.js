import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()


//app.use is used for configuration and middleware

app.use(cors({
    origin: process.env.CORS_ORIGIN, //from where data will be accepted in backend 
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"))
app.use(cookieParser())

export default app