import request from "supertest"
import app from "../src/app.js"
import { startDb, clearDb, stopDb, makeUser } from "./helpers.js"
import { Click } from "../src/models/click.models.js"

beforeAll(startDb)
afterEach(clearDb)
afterAll(stopDb)

//this file checks the core promise of the whole project: short link sends visitors to right place and visit gets counted

test("known code redirects with 302", async () => {
    //making user
    const token = await makeUser("a@test.com")

    //creating link
    const created = await request(app)
        .post("/api/links")
        .set("Authorization", `Bearer ${token}`)
        .send({ url: "google.com" })

    //this response holds the short code
    const res = await request(app).get(`/${created.body.shortCode}`)

    //301 is cached permanently by browsers, which would break click counting and link edits
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe("https://google.com/")
})

test("unknown code returns 404", async () => {

    //not a valid code 
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

    //visiting the code once
    await request(app).get(`/${code}`)

    //waiting for 200ms so that accessCount is written in our database
    await new Promise((r) => setTimeout(r, 200))

    //read the link as owner and accessCount should be one
    const details = await request(app)
        .get(`/api/links/${code}`)
        .set("Authorization", `Bearer ${token}`)
    expect(details.body.accessCount).toBe(1)
})


test("a visit records one click", async () => {
    const token = await makeUser("a@test.com")
    const created = await request(app)
        .post("/api/links")
        .set("Authorization", `Bearer ${token}`)
        .send({ url: "google.com" })

    await request(app).get(`/${created.body.shortCode}`)
    await new Promise((r) => setTimeout(r, 200))   // the click is written after the response

    const clicks = await Click.find({})
    expect(clicks.length).toBe(1)
    expect(clicks[0].linkId.toString()).toBe(created.body.id)
})