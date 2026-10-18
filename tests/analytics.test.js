import request from "supertest"
import app from "../src/app.js"
import { startDb, clearDb, stopDb, makeUser } from "./helpers.js"

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)


const setup = async () => {
    const token = await makeUser("a@test.com")
    const created = await request(app)
        .post("/api/links")
        .set("Authorization", `Bearer ${token}`)
        .send({ url: "google.com "})

    return { token, code: created.body.shortCode }
}


test("owner gets correct counts after visits", async () => {
    const { token, code } = await setup()

    for (let i = 0; i < 3; i++) await request(app).get(`/${code}`)
    await new Promise((r) => setTimeout(r, 300))   // clicks are written after the response

    const res = await request(app)
        .get(`/api/links/${code}/analytics`)
        .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.totalClicks).toBe(3)
    expect(res.body.clicksPerDay.length).toBe(7)
})

test("non-owner gets 404", async () => {
    const { code } = await setup()
    const otherToken = await makeUser("b@test.com")

    const res = await request(app)
        .get(`/api/links/${code}/analytics`)
        .set("Authorization", `Bearer ${otherToken}`)

    expect(res.status).toBe(404)
})

test("bad range falls back to 7d", async () => {
    const { token, code } = await setup()

    const res = await request(app)
        .get(`/api/links/${code}/analytics?range=banana`)
        .set("Authorization", `Bearer ${token}`)

    expect(res.body.range).toBe("7d")
})

test("no token returns 401", async () => {
    const { code } = await setup()

    const res = await request(app).get(`/api/links/${code}/analytics`)
    expect(res.status).toBe(401)
})
