import mongoose, { Schema } from "mongoose";


const userSchema = new Schema({

    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trime: true
    },

    passwordHash: {
        type: String,
        required: true
    }


}, {
    timestamps: true
})

export const User = mongoose.model("User", userSchema)