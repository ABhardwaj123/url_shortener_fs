import mongoose from "mongoose"

//starts a real mongoDB inside memory on a random port , just for test run
import { MongoMemoryServer } from "mongodb-memory-server"

//sends fake HTTP requests to my express app
import request from "supertest"
import app from "../src/app.js"

//this file is setup as every test file needs a database , logged in user , clean slate between tests

let mongod

export const startDb = async () => {
    process.env.JWT_SECRET = "test-secret"
    process.env.BASE_URL = "http://localhost:3000"

    //connecting to mongoose. starts temporary Mongo
    //they read and write to throwaway database and never to atlas
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())
}

export const clearDb = async () => {
    //mongoose.connection.collections holds every collection
    //this loop deleted all documents 

    for (const key in mongoose.connection.collections) {
        //{} means match every things. cleaning after test is important
        await mongoose.connection.collections[key].deleteMany({})
    }
}

//disconnects Mongoose and shuts the temporary mongo down
export const stopDb = async () => {
    await mongoose.disconnect()
    await mongod.stop()
}


//creating a fake user
export const makeUser = async (email) => {
    const creds = { email, password: "password123" }
    await request(app).post("/api/auth/register").send(creds)
    const res = await request(app).post("/api/auth/login").send(creds)
    return res.body.token
}