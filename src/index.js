import app from './app.js';
import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        app.on("error", (error)=>{
            console.error("ERR: ", error)
            throw error
        })
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MONGO db connection failed !!!", error)
})










/*
// require('dotenv').config({path: './env'})
// import mongoose from "mongoose";
// import { DB_NAME } from './constants'
import express from 'express'
const app =express()

; (async () => { //iffi
    try{
      await  mongoose.connect(`${process.env.MONGODB_URI}/ ${ DB_NAME}`)

      app.on('error', (error) => {
        console.log("ERR: ", error)
        throw error
      })

      app.listen(process.env.PORT, () => {
        console.log(`App is listening on port ${process.env.PORT}`)
      })

    }catch(error) {
        console.error("ERROR: ",error)
    }
}) () 
    */