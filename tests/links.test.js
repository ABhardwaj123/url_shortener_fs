import request from "supertest"
import app from "../src/app.js"
import { startDb, clearDb, stopDb, makeUser } from "./helpers.js"

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

test("create normalizes the url", async () => {
    const token = await makeUser("a@test.com")
    const res = await request(app)
        .post("/api/links")
        .set("Authorization", `Bearer ${token}`)
        .send({ url: "google.com" })
    expect(res.status).toBe(201)
    expect(res.body.url).toBe("https://google.com/")
})

test("invalid URL is rejected" , async() => {
    const token = await makeUser("b@test.com")
    const res = await request(app)
        .post("/api/links")
        .set("Authorization",  `Bearer ${token}`)
        .send({ url: "not a url"})
    expect(res.status).toBe(400)
}) 

test("no token is rejected" , async() => {
    const token = await makeUser("c@test.com")
    const res = await request(app)
        .post("/api/links")
        .send({url: "google.com"})
    expect(res.status).toBe(401)
})

const setup = async () => {
    const tokenA = await makeUser("a@test.com")
    const tokenB = await makeUser("b@test.com")
    const created = await request(app)
        .post("/api/links")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ url: "google.com" })
    return { tokenA, tokenB, code: created.body.shortCode }
}

test("non-owner gets 404 on GET", async () => {
    const { tokenB, code } = await setup()

    const res = await request(app)
        .get(`/api/links/${code}`)
        .set("Authorization", `Bearer ${tokenB}`)

    expect(res.status).toBe(404)
})

test("non-owner gets 404 on PATCH and DELETE, and the link survives", async () => {
    const { tokenA, tokenB, code } = await setup()

    const patch = await request(app)
        .patch(`/api/links/${code}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ url: "wikipedia.org" })
    expect(patch.status).toBe(404)

    const del = await request(app)
        .delete(`/api/links/${code}`)
        .set("Authorization", `Bearer ${tokenB}`)
    expect(del.status).toBe(404)

    // the owner can still read it, so nothing was changed or deleted
    const check = await request(app)
        .get(`/api/links/${code}`)
        .set("Authorization", `Bearer ${tokenA}`)
    expect(check.status).toBe(200)
    expect(check.body.url).toBe("https://google.com/")   // not changed to wikipedia
})

test("list only shows my own links", async () => {
    const tokenA = await makeUser("a@test.com")
    const tokenB = await makeUser("b@test.com")

    // A creates two links
    for (const url of ["google.com", "wikipedia.org"]) {
        await request(app)
            .post("/api/links")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ url })
    }

    const listA = await request(app)
        .get("/api/links")
        .set("Authorization", `Bearer ${tokenA}`)
    const listB = await request(app)
        .get("/api/links")
        .set("Authorization", `Bearer ${tokenB}`)

    expect(listA.body.total).toBe(2)
    expect(listB.body.total).toBe(0)
})