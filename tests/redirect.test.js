import request from "supertest"
import app from "../src/app.js"
import { startDb, clearDb, stopDb, makeUser } from "./helpers.js"

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

test("known code redirects with 302", async () => {
    const token = await makeUser("a@test.com")
    const created = await request(app)
        .post("/api/links")
        .set("Authorization", `Bearer ${token}`)
        .send({ url: "google.com" })

    const res = await request(app).get(`/${created.body.shortCode}`)

    expect(res.status).toBe(302)
    expect(res.headers.location).toBe("https://google.com/")
})

test("unknown code returns 404", async () => {
    const res = await request(app).get("/doesnotexist")
    expect(res.status).toBe(404)
})

test("a visit increases accessCount", async () => {
    const token = await makeUser("a@test.com")
    const created = await request(app)
        .post("/api/links")
        .set("Authorization", `Bearer ${token}`)
        .send({ url: "google.com" })
    const code = created.body.shortCode

    await request(app).get(`/${code}`)

    // the count is written after the redirect is sent, so give it a moment
    await new Promise((r) => setTimeout(r, 200))

    const details = await request(app)
        .get(`/api/links/${code}`)
        .set("Authorization", `Bearer ${token}`)
    expect(details.body.accessCount).toBe(1)
})