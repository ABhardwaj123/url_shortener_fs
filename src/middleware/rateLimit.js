//the counting logic
import rateLimit from "express-rate-limit";

//logic counts in Redis
import { RedisStore } from "rate-limit-redis"
import { getRedis } from "../config/redis.js";

//limit -> how many requests are allowed in a window

//when skipSuccessfulRequests=true for loginLimiter we only count failed attempts as the threat is guessing and successes are harmless
//registerUser counts everything because the threat is mass account creation


const build = ({ windowMs , limit , prefix , keyGenerator , skipSuccessfulRequests}) => {

    const redis = getRedis()

    return rateLimit({
        windowMs,
        limit,
        keyGenerator, // "who" to count. If undefined, it counts by IP
        skipSuccessfulRequests,
        standardHeaders: true,  //send Retry-After and RateLimit headers
        legacyHeaders: false,   //skip the old X-rateLimit-* headers
        passOnStoreError: true, //if redis breaks , let requests through
        validate: { creationStack: false },   // we build once, lazily, on purpose
        
        //if redis is available, use it as store else use the library's default in-memory store
        //store is where the count's are kept
        ...(redis && {
            store: new RedisStore({
                sendCommand: (...args) => redis.call(...args),
                prefix: `rl:${prefix}:`
            })
        }),

        handler: (req, res) =>
            res.status(429).json({ message: "Too many requests, please try again later" })

    })
}



const lazy = (options) => {
    let limiter 
    return (req , res , next) => {

        //if rate limiting is switched off, skip it
        if (process.env.RATE_LIMIT_ENABLED !== "true") return next()

        //if real rate-limiter hasn't been created , create it now
        limiter ??= build(options)
        //run the rate-limiter
        return limiter(req, res, next)
    }
}

//many users can come under same IP like WiFi
//one person can have many IPs like switching from WiFi to mobileData

// login: 20 per minute per IP, only failed attempts count
export const loginLimiter = lazy({
    windowMs: 60 * 1000,
    limit: 20,
    prefix: "login",
    skipSuccessfulRequests: true
})

// register: 20 per hour per IP, every request counts
export const registerLimiter = lazy({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    prefix: "register"
})

//20 per hour and counted per user(works only after authentication)
export const createLinkLimiter = lazy({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    prefix: "create",
    keyGenerator: (req) => req.user.id
})

//redirection rate limiter. counted by IP
export const redirectLimiter = lazy({ windowMs: 60 * 1000, limit: 120, prefix: "redirect" })