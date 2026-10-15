import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import request from "supertest"
import app from "../src/app.js"

let mongod

export const startDb = async () => {
    process.env.JWT_SECRET = "test-secret"
    process.env.BASE_URL = "http://localhost:3000"
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())
}

export const clearDb = async () => {
    for (const key in mongoose.connection.collections) {
        await mongoose.connection.collections[key].deleteMany({})
    }
}

export const stopDb = async () => {
    await mongoose.disconnect()
    await mongod.stop()
}


export const makeUser = async (email) => {
    const creds = { email, password: "password123" }
    await request(app).post("/api/auth/register").send(creds)
    const res = await request(app).post("/api/auth/login").send(creds)
    return res.body.token
}