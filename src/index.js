// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'

// import mongoose from "mongoose";
// import { DB_NAME } from './constants'

import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
    application.listen(process.env.PORT || 8000 , ()=>{
        application.on("error", (error)=>{
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