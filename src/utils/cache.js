import { getRedis } from "../config/redis.js";

//implementing caching logic

//generates redis key for a particular link to avoid collisions
const key = (code) => `link:${code}`

//time before expiry : 24hrs
const TTL_SECONDS = 24 * 60 * 60

//retrieving a link from cache
export const getCachedLink = async(code) => {

    const redis = getRedis()
    if(!redis) return null

    try{
        const value = await redis.get(key(code))
        //redis stores string. we convert it back to object
        return value ? JSON.parse(value) : null
    }catch (err) {
        console.error("cache get failed:", err.message)
        return null
    }
}

//store a link in redis
export const setCachedLink = async (code, data) => {
    const redis = getRedis()
    if (!redis) return
    try {
        //setting a value in cache
        await redis.set(key(code), JSON.stringify(data), "EX", TTL_SECONDS)
    } catch (err) {
        console.error("cache set failed:", err.message)
    }
}

//deleting from cache
export const invalidateLink = async (code) => {
    const redis = getRedis()
    if (!redis) return
    try {
        await redis.del(key(code))
    } catch (err) {
        console.error("cache delete failed:", err.message)
    }
}