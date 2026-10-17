import request from "supertest"
import app from "../src/app.js"
import { startDb, clearDb, stopDb } from "./helpers.js"

beforeAll(startDb)
afterEach(clearDb)
afterAll(async () => {
    process.env.RATE_LIMIT_ENABLED = "false"
    await stopDb()
})

const creds = {
    email: "a@test.com",
    password: "password123"
}

test("successful logins are not counted", async () => {

    //safety measure to register our dummy user
    process.env.RATE_LIMIT_ENABLED = "false"
    await request(app).post("/api/auth/register").send(creds)

    //before testing , enabling the rate limit
    process.env.RATE_LIMIT_ENABLED = "true"
    let last
    for (let i = 0; i < 21; i++) {
        last = await request(app).post("/api/auth/login").send(creds)
    }
    expect(last.status).toBe(200)
}, 15000)



test("failed logins are limited and the response has Retry-After", async () => {
    process.env.RATE_LIMIT_ENABLED = "true"

    let last
    for (let i = 0; i < 21; i++) {
        last = await request(app)
            .post("/api/auth/login")
            .send({ email: "x@test.com", password: "wrongpass1" })
    }

    expect(last.status).toBe(429)
    expect(last.headers["retry-after"]).toBeDefined()
})