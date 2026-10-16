import express from "express"
import helmet from "helmet"
import authRouter from "./routes/auth.js"
import linkRouter from "./routes/links.js";
import redirectRouter from "./routes/redirect.js";
import cors from "cors"

//creating an instance of express app
const app = express()

//helemt adds security related HTTP response headers.
//makes browsers behave more safely
app.use(helmet())

//It parses a JSON body into a JavaScript object on req.body. Without it, req.body is undefined
app.use(express.json())

//using cors helps us to be selective about which are the urls from which we can accept request
app.use(cors())

//using auth routers which has all auth routes
app.use("/api/auth", authRouter)

//using link routers which has all link routes
app.use("/api/links", linkRouter);

app.get('/' , (req , res) => {
    res.send('server is running')
})


app.use("/", redirectRouter);


export default app