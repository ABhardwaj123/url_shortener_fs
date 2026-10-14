import express from "express"
import helmet from "helmet"
import authRouter from "./routes/auth.js"
import linkRouter from "./routes/links.js";
import redirectRouter from "./routes/redirect.js";




const app = express()
app.use(helmet())
app.use(express.json())

app.use("/api/auth", authRouter)
app.use("/api/links", linkRouter);
app.use("/", redirectRouter);

app.get('/' , (req , res) => {
    res.send('server is running')
})

export default app