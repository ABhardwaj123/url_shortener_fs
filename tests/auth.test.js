import request from "supertest"
import app from "../src/app.js"
import { startDb, clearDb, stopDb } from "./helpers.js"

//before all tests, start database
beforeAll(startDb)

//after each test , clean slate
afterEach(clearDb)

//after all tests , stop the connection
afterAll(stopDb)

const user = { email: "a@test.com", password: "password123" }

test("register returns 201", async () => {
    const res = await request(app).post("/api/auth/register").send(user)
    expect(res.status).toBe(201)
})

test("duplicate register returns 409", async () => {
    //registering once
    await request(app).post("/api/auth/register").send(user)

    //trying to register the same user again
    const res = await request(app).post("/api/auth/register").send(user)
    expect(res.status).toBe(409)
})

test("wrong password and unknown email give the same 401", async () => {
    await request(app).post("/api/auth/register").send(user)

    //trying to log in with wrong password
    const wrong = await request(app)
        .post("/api/auth/login")
        .send({ ...user, password: "wrongpass1" })

    //trying to log in with email that doesn't exist
    const unknown = await request(app)
        .post("/api/auth/login")
        .send({ email: "x@test.com", password: "password123" })

    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
    expect(wrong.body).toEqual(unknown.body)   // identical, so no user enumeration
})

test("protected route rejects a missing token", async () => {
    //no authentication and authorization. sending request with no token
    const res = await request(app).get("/api/links")
    expect(res.status).toBe(401)
})