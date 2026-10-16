import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";
import validator from 'validator'
import jwt from "jsonwebtoken"

const registerUser = async(req , res) => {

    try{
        //object destructing
        const {email , password} = req.body
        if(!email || !validator.isEmail(email) || !password){
            return res.status(400).json({
                message: 'all fields are required'
            })
        }

        if (password.length < 8) return res.status(400).json({ message: 'password must be at least 8 characters' })

        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.status(409).json({
                message: 'user is already registered'
            })
        }

        //saving the hashed password in database with 10 salt rounds
        const hashed_password = await bcrypt.hash(password , 10)

        const newUser = await User.create({
            email,
            passwordHash: hashed_password
        })


        return res.status(201).json({
            message: 'user created successfully',
            user: {id: newUser._id , email: newUser.email}
        })

    }catch(err){

        console.error(err)
        
        return res.status(500).json({
            message: 'Something went wrong'
        })

    }
}


const loginUser = async(req , res) => {
    try{

        const {email: rawEmail , password} = req.body
        if(!rawEmail || !validator.isEmail(rawEmail) || !password){
            return res.status(400).json({
                message: 'all fields are required'
            })
        }

        const email = rawEmail.toLowerCase().trim()

        const user = await User.findOne({email})

        if(!user){
            return res.status(401).json({
                message: 'invalid credentials'
            })
        }
        
        const match = await bcrypt.compare(password , user.passwordHash)
        if(!match){
            return res.status(401).json({ message: 'invalid credentials' })
        }

        //token has {payload , secret , options}
        //payload is basically the user id. it is base64-encoded and anybody can read it
        //secret is used to sign the token, while sending the request again if secret is found tampered , request is rejected
        //token is for authentication

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d"}
        )

        return res.status(200).json({
            message: 'login successful',
            token,
            user: { id: user._id, email: user.email }
        })

    }catch(err){

        console.error(err)
        return res.status(500).json({
            message: 'Something went wrong'
        })

    }
}


export {registerUser , loginUser}