//ioredis is nodejs library 
import Redis from "ioredis";


//client stores redis connection object
let client = null

//redis commands include -> get , set , del

export const getRedis = () => {

    //if caching not enabled , return null
    if(process.env.CACHE_ENABLED !== "true") return null

    //creating a redis client
    if(!client){
        client = new Redis(process.env.REDIS_URL , {
            //this prevents the commands to be queued when redis is disconnected
            enableOfflineQueue: false,

            //limits the number of retries of a redis command
            maxRetriesPerRequest: 1,

            //connection attempt timeout -> 2secs / 2000ms
            connectTimeout: 2000
        })
        //listening for errors -> server down , incorrect REDIS_URL etc
        client.on("error", (err) => console.error("redis error:", err.message))
    }

    return client
} 

// open the connection at startup and wait until it's ready (max 3 s)
export const connectRedis = async () => {
    const redis = getRedis()

    //if caching is disabled or redis is already ready
    if (!redis || redis.status === "ready") return

    //either wait for 3 secs or wait for redis to become ready
    await new Promise((resolve) => {
        redis.once("ready", resolve)
        setTimeout(resolve, 3000)   // Redis unreachable: start anyway, the app falls back to Mongo
    })
}