import jwt from 'jsonwebtoken'

const protect = (req , res , next) => {
    //when client makes request , it sends an HTTP header. It has method , Authorization
    //for auth middleware , we just need the authorization parseInt
    const authHeader = req.headers.authorization

    //sending with Bearer is convention
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'No token provided'
        })
    }
    //Authorization: Bearer <token>
    const token = authHeader.split(' ')[1]

    try{
        //token should not be expired , tampered
        const decoded = jwt.verify(token , process.env.JWT_SECRET)

        //actual route controller will have access to req.user.id
        //attaching decoded payload to req.user
        //access by req.user.id
        req.user = decoded
        next()

    }catch(err){
        return res.status(401).json({
            message: 'invalid or expired token'
        })
    }
}

export {protect}