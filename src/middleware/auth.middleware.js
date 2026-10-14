import jwt from 'jsonwebtoken'

const protect = (req , res , next) => {

    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'No token provided'
        })
    }
    //Authorization: Bearer <token>
    const token = authHeader.split(' ')[1]

    try{

        const decoded = jwt.verify(token , process.env.JWT_SECRET)

        //actual route controller will have access to req.user.id
        req.user = decoded
        next()

    }catch(err){
        return res.status(401).json({
            message: 'invalid or expired token'
        })
    }
}

export {protect}