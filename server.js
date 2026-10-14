import dotenv from "dotenv"
import app from "./src/app.js"
import connectDB from "./src/config/db.js"

dotenv.config({
    path: ".env"
})

const PORT = process.env.PORT || 3000

connectDB().then( () => {

    app.listen(PORT , () =>{
        console.log(`server is running on port ${PORT}`)
    })
})

