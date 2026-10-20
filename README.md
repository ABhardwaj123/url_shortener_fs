## URL Shortener

A URL shortener with jwt-based authentication , Redis-cached redirects , rate limiting and per click analytics built using Node.js , Express and MongoDB.


## Features

-> JWT authentication (register and login)
-> Short links with URL normalization and validation
-> Redis cache on the redirect path, with invalidation on edit and delete, and a fallback to MongoDB if Redis is down

-> Per-link analytics: total clicks and clicks per day for the last 7 or 30 days
-> 20 Jest and Supertest tests, run on every push by GitHub Actions


## Tech stack

Runtime and Framework                      Node.js , Express
Database                                   MongoDB Atlas
Caching                                    Redis(Upstash)
Authentication                             JWT, bcrypt
Frontend                                   HTML , CSS , JS


## API

Method	          Route	                    Auth	               Purpose
POST	       /api/auth/register	        none	          Create an account
POST	        /api/auth/login	            none	          Returns a JWT
POST	        /api/links	                yes	            Create a short link
GET	          /api/links?page&limit	        yes	             List my links (paginated)
GET	           /api/links/:code	            owner	             Link details
PATCH	      /api/links/:code	            owner	         Change the destination URL
DELETE	       /api/links/:code	            owner	             Delete a link
GET	/api/links/:code/analytics?range=7d|30d	owner	          Total clicks and clicks per day
GET	           /:code	                    public	              Redirect



## Analytics Response


{
  "range": "7d",
  "totalClicks": 4,
  "clicksPerDay": [{ "date": "2026-10-18", "clicks": 4 }]
}



## Performance

Metric	                             Value              With Redis Cache
Requests/sec (avg)	                 65.5                    798 to 954
p50 latency	                        966 ms                   48 to 58 ms
p97.5 latency	                    1091 ms                  104 to 125 ms
p99 latency	                        2017 ms                  138 to 158 ms


Setup: autocannon -c 50 -d 30, local app, Atlas Mumbai, one hot link, a click write after every redirect.




## ENVIRONMENT VARIABLES
Variable	                              Purpose
MONGO_URL	                      MongoDB connection string
JWT_SECRET	                       Secret used to sign tokens
JWT_EXPIRES_IN	                 Token lifetime, defaults to 7d
BASE_URL	                  Public address used to build short URLs, for example http://localhost:3000
PORT	                           Server port, defaults to 3000
REDIS_URL	                        Redis connection string 
CACHE_ENABLED	                true to use Redis for the cache and the rate-limit store
RATE_LIMIT_ENABLED	             true to turn rate limiting on