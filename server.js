//server.js starts the server
import "dotenv/config"
import app from "./src/app.js"
import connectDB from "./src/config/db.js"
import { connectRedis } from "./src/config/redis.js"



//getting port on which our backend is listening
const PORT = process.env.PORT || 3000

//connecting the database and then showing a message
connectDB().then( async () => {
    await connectRedis()

    //listening after connecting so that no half-working server
    app.listen(PORT , () =>{
        console.log(`server is running on port ${PORT}`)
    })
})

